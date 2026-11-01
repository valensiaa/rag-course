import { forwardRef } from 'react';
import type { Citation } from '../../types/chat';
import { splitChunk, squash } from '../../lib/citations';

interface Props {
  citation: Pick<Citation, 'chunkText' | 'highlight'>;
  /** Limit surrounding context (chars) and collapse whitespace, for previews. */
  context?: number;
  /** Uncited chunks have no supporting passage to highlight. */
  highlight?: boolean;
  className?: string;
}

/** Renders a chunk with its supporting passage in a <mark>. The ref points at the mark. */
export const HighlightedChunk = forwardRef<HTMLElement, Props>(function HighlightedChunk(
  { citation, context, highlight = true, className = '' },
  markRef,
) {
  const compact = context !== undefined;
  const fmt = compact ? squash : (s: string) => s;

  if (!highlight) {
    const text = compact ? squash(citation.chunkText).slice(0, context * 2) : citation.chunkText;
    return <div className={`${compact ? '' : 'whitespace-pre-wrap'} ${className}`}>{text}</div>;
  }

  const s = splitChunk(citation, context);
  return (
    <div className={`${compact ? '' : 'whitespace-pre-wrap'} ${className}`}>
      {s.truncatedStart && <span aria-hidden="true">… </span>}
      <span className="text-ink-2">{fmt(s.before)}</span>
      <mark ref={markRef} className="passage">
        <span className="sr-only">Supporting passage start: </span>
        {fmt(s.passage)}
        <span className="sr-only"> :supporting passage end.</span>
      </mark>
      <span className="text-ink-2">{fmt(s.after)}</span>
      {s.truncatedEnd && <span aria-hidden="true"> …</span>}
    </div>
  );
});
