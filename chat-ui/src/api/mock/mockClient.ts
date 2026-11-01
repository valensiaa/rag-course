/**
 * In-browser mock of the chat backend. Streams `StreamEvent`s with realistic
 * delays. Swap it out via `src/api/index.ts`.
 *
 * Dev triggers (anywhere in the message):
 *   #error      retryable error before retrieval
 *   #ratelimit  rate-limit error with a countdown
 */
import type { ChatRequest, Citation, DocArea, RetrievedDoc, StreamEvent } from '../../types/chat';
import { fallbackScenario, scenarios, type Scenario } from './scenarios';

const AREA_LABEL: Record<DocArea, string> = {
  js: 'JavaScript',
  css: 'CSS',
  html: 'HTML',
  webapi: 'Web APIs',
  http: 'HTTP',
};

/** Scenarios with `failFirstAttempt` fail once per page load, then succeed. */
const failedOnce = new Set<string>();

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    function onAbort() {
      clearTimeout(timer);
      reject(signal.reason);
    }
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

const jitter = (min: number, max: number) => min + Math.random() * (max - min);

/** Split text into word-ish tokens of 1–3 words, like an LLM stream. */
export function tokenize(text: string): string[] {
  const words = text.match(/\S+\s*|\s+/g) ?? [];
  const tokens: string[] = [];
  for (let i = 0; i < words.length; ) {
    const n = 1 + Math.floor(Math.random() * 3);
    tokens.push(words.slice(i, i + n).join(''));
    i += n;
  }
  return tokens;
}

/** One entry per page (fragment stripped), in first-seen order. */
function uniquePages(chunks: Citation[]): RetrievedDoc[] {
  const seen = new Map<string, RetrievedDoc>();
  for (const c of chunks) {
    const key = c.url.split('#')[0];
    if (!seen.has(key)) seen.set(key, { title: c.title, url: key, area: c.area });
  }
  return [...seen.values()];
}

function pickScenario(req: ChatRequest): Scenario {
  const found = scenarios.find((s) => s.match.test(req.message)) ?? fallbackScenario;
  // Simulate scope-filtered retrieval: docs outside the scope are never retrieved.
  if (req.scope !== 'all' && found.area && found.area !== req.scope) {
    return {
      ...fallbackScenario,
      key: `${found.key}:out-of-scope`,
      answer: `Nothing in the **${AREA_LABEL[req.scope]}** docs matched this question. It looks like a **${AREA_LABEL[found.area]}** topic. Switch the scope to *${AREA_LABEL[found.area]}* or *All* and ask again.`,
      suggestions: [],
    };
  }
  return found;
}

export async function* mockStreamChat(req: ChatRequest, signal: AbortSignal): AsyncGenerator<StreamEvent> {
  // Time to first byte.
  await sleep(jitter(250, 450), signal);

  if (/#ratelimit\b/i.test(req.message)) {
    yield {
      type: 'error',
      code: 'rate_limited',
      message: 'You’re sending questions faster than the service allows.',
      retryable: true,
      retryAfterSeconds: 8,
    };
    return;
  }
  if (/#error\b/i.test(req.message)) {
    yield { type: 'error', message: 'The retrieval service didn’t respond (503).', retryable: true };
    return;
  }

  const scenario = pickScenario(req);

  // Retrieval step.
  await sleep(jitter(700, 1200), signal);
  const docs = scenario.noSources ? [] : uniquePages([...scenario.cited, ...scenario.notCited]);
  yield { type: 'retrieval', query: scenario.query || req.message, docs };

  if (scenario.noSources) yield { type: 'no_sources' };

  // Model "thinking" before the first token.
  await sleep(jitter(350, 650), signal);

  const tokens = tokenize(scenario.answer);
  const failAt =
    scenario.failFirstAttempt && !failedOnce.has(scenario.key)
      ? Math.floor(tokens.length * scenario.failFirstAttempt.afterFraction)
      : -1;

  let fences = 0;
  for (let i = 0; i < tokens.length; i++) {
    if (i === failAt) {
      failedOnce.add(scenario.key);
      await sleep(600, signal);
      yield { type: 'error', message: scenario.failFirstAttempt!.message, retryable: true };
      return;
    }
    yield { type: 'token', text: tokens[i] };
    // Code streams faster than prose; occasional longer pauses feel organic.
    fences += tokens[i].split('```').length - 1;
    const inCode = fences % 2 === 1;
    await sleep(inCode ? jitter(6, 16) : Math.random() < 0.04 ? jitter(120, 260) : jitter(14, 38), signal);
  }

  if (!scenario.noSources) {
    await sleep(jitter(120, 240), signal);
    yield { type: 'citations', cited: scenario.cited, retrievedNotCited: scenario.notCited };
  }

  if (scenario.suggestions.length) {
    await sleep(jitter(150, 300), signal);
    yield { type: 'suggestions', questions: scenario.suggestions };
  }

  yield { type: 'done' };
}
