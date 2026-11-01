import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkCitations, stripPartialMarker } from '../lib/remarkCitations';
import { groupByPage, splitChunk } from '../lib/citations';
import { scenarios } from '../api/mock/scenarios';
import { mockStreamChat } from '../api/mock/mockClient';
import type { StreamEvent } from '../types/chat';

const render = (md: string) =>
  renderToStaticMarkup(
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkCitations]}
      components={{ 'cite-ref': (p: { 'data-cite'?: string }) => <b>{`#${p['data-cite']}`}</b> } as Components}
    >
      {md}
    </ReactMarkdown>,
  );

describe('remarkCitations', () => {
  it('turns [n] markers into citation elements', () => {
    expect(render('Skips holes [1][2].')).toBe('<p>Skips holes <b>#1</b><b>#2</b>.</p>');
  });
  it('leaves markers inside code alone', () => {
    expect(render('Use `a[1]` here [3]')).toBe('<p>Use <code>a[1]</code> here <b>#3</b></p>');
    expect(render('```js\nx[1]\n```')).toContain('x[1]');
  });
  it('works inside lists and tables', () => {
    expect(render('- item [4]')).toContain('<b>#4</b>');
    expect(render('| a |\n| - |\n| b [5] |')).toContain('<b>#5</b>');
  });
  it('hides a marker that is still streaming', () => {
    expect(stripPartialMarker('text [1')).toBe('text ');
    expect(stripPartialMarker('text [')).toBe('text ');
    expect(stripPartialMarker('text [1]')).toBe('text [1]');
  });
});

describe('groupByPage', () => {
  it('merges chunks from the same page regardless of fragment', () => {
    const js = scenarios.find((s) => s.key === 'js-map-sparse')!;
    const pages = groupByPage(js.cited);
    expect(pages).toHaveLength(4);
    expect(pages[0].title).toBe('Array.prototype.map()');
    expect(pages[0].chunks.map((c) => c.id)).toEqual([1, 2]);
  });
  it('unions statuses across chunks', () => {
    const clip = scenarios.find((s) => s.key === 'webapi-clipboard')!;
    const exec = groupByPage(clip.cited).find((p) => p.title.includes('execCommand'))!;
    expect(exec.status).toEqual(['deprecated']);
    expect(exec.chunks.map((c) => c.id)).toEqual([3, 4, 5]);
  });
});

describe('mock scenarios', () => {
  it('every [n] in an answer has a citation, and every citation is used', () => {
    for (const s of scenarios) {
      const markers = new Set([...s.answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
      expect([...markers].sort(), s.key).toEqual(s.cited.map((c) => c.id).sort());
    }
  });
  it('highlights resolve to non-empty passages', () => {
    for (const s of scenarios) {
      for (const c of [...s.cited, ...s.notCited]) {
        const { passage } = splitChunk(c);
        expect(passage.length, c.chunkId).toBeGreaterThan(10);
      }
    }
  });
});

describe('mockStreamChat', () => {
  const collect = async (message: string, scope: 'all' | 'css' = 'all') => {
    const events: StreamEvent[] = [];
    for await (const e of mockStreamChat({ conversationId: 't', message, scope }, new AbortController().signal)) events.push(e);
    return events;
  };

  it('streams retrieval → tokens → citations → done', async () => {
    const ev = await collect('How do I lay out a page with grid-template-areas?');
    const types = [...new Set(ev.map((e) => e.type))];
    expect(types).toEqual(['retrieval', 'token', 'citations', 'suggestions', 'done']);
  }, 20_000);

  it('fails the Cache-Control question once, then succeeds', async () => {
    const first = await collect('no-cache vs no-store?');
    expect(first.at(-1)).toMatchObject({ type: 'error', retryable: true });
    const second = await collect('no-cache vs no-store?');
    expect(second.at(-1)).toEqual({ type: 'done' });
  }, 20_000);

  it('filters by scope', async () => {
    const ev = await collect('How does map() handle sparse arrays?', 'css');
    expect(ev.some((e) => e.type === 'no_sources')).toBe(true);
  }, 20_000);
});
