import type { ChatRequest, StreamEvent } from '../types/chat';

/**
 * Real backend client. Expects `POST {baseUrl}/chat` to respond with
 * newline-delimited JSON, one `StreamEvent` per line.
 */
export async function* httpStreamChat(
  baseUrl: string,
  req: ChatRequest,
  signal: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/x-ndjson' },
    body: JSON.stringify(req),
    signal,
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After')) || 30;
    yield {
      type: 'error',
      code: 'rate_limited',
      message: 'You’re sending questions faster than the service allows.',
      retryable: true,
      retryAfterSeconds: retryAfter,
    };
    return;
  }
  if (!res.ok || !res.body) {
    yield { type: 'error', message: `Request failed (${res.status}).`, retryable: res.status >= 500 };
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += value;
    let newline: number;
    while ((newline = buffer.indexOf('\n')) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line) yield JSON.parse(line) as StreamEvent;
    }
  }
  if (buffer.trim()) yield JSON.parse(buffer) as StreamEvent;
}
