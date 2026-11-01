import type { Citation, DocArea, DocStatus } from '../types/chat';

/** A single MDN page, with every retrieved chunk that came from it. */
export interface SourcePage {
  key: string; // page URL without fragment
  url: string;
  title: string;
  breadcrumb: string[];
  area: DocArea;
  status: DocStatus[];
  lastModified: string;
  chunks: Citation[];
}

export const pageKey = (url: string) => url.split('#')[0];

/** Merge chunks from the same page, preserving first-seen order. */
export function groupByPage(chunks: Citation[]): SourcePage[] {
  const pages = new Map<string, SourcePage>();
  for (const c of chunks) {
    const key = pageKey(c.url);
    const page = pages.get(key);
    if (!page) {
      pages.set(key, {
        key,
        url: key,
        title: c.title,
        breadcrumb: c.breadcrumb,
        area: c.area,
        status: [...c.status],
        lastModified: c.lastModified,
        chunks: [c],
      });
      continue;
    }
    page.chunks.push(c);
    for (const s of c.status) if (!page.status.includes(s)) page.status.push(s);
    if (c.lastModified > page.lastModified) page.lastModified = c.lastModified;
  }
  return [...pages.values()];
}

export interface Snippet {
  before: string;
  passage: string;
  after: string;
  truncatedStart: boolean;
  truncatedEnd: boolean;
}

/** Split a chunk around its highlight. `context` limits surrounding chars (for previews). */
export function splitChunk(c: Pick<Citation, 'chunkText' | 'highlight'>, context = Infinity): Snippet {
  const { chunkText: text } = c;
  const start = Math.max(0, Math.min(c.highlight.start, text.length));
  const end = Math.max(start, Math.min(c.highlight.end, text.length));

  let from = Math.max(0, start - context);
  let to = Math.min(text.length, end + context);
  // Snap to word boundaries so previews don't start mid-word.
  if (from > 0) from = text.indexOf(' ', from) + 1 || from;
  if (to < text.length) to = text.lastIndexOf(' ', to) > end ? text.lastIndexOf(' ', to) : to;

  return {
    before: text.slice(from, start),
    passage: text.slice(start, end),
    after: text.slice(end, to),
    truncatedStart: from > 0,
    truncatedEnd: to < text.length,
  };
}

/** Collapse whitespace for compact previews. */
export const squash = (s: string) => s.replace(/\s+/g, ' ');

export function formatModified(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' });
}
