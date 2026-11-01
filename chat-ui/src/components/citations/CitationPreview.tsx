import type { Citation } from '../../types/chat';
import { AreaTag, Breadcrumb, MdnLink, Modified, StatusBadges } from './SourceMeta';
import { HighlightedChunk } from './HighlightedChunk';

/** Content of the hover/focus card. Positioning lives in <CitationChip>. */
export function CitationPreview({ citation }: { citation: Citation }) {
  return (
    <div className="w-[min(380px,calc(100vw-24px))] rounded-lg border border-rule-strong bg-surface p-3.5 text-left shadow-pop">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[11px] font-semibold text-accent">[{citation.id}]</span>
        <AreaTag area={citation.area} />
        <StatusBadges status={citation.status} />
        <Modified iso={citation.lastModified} className="ml-auto" />
      </div>
      <p className="mt-2 text-[14px] font-semibold leading-snug text-ink">{citation.title}</p>
      <Breadcrumb items={citation.breadcrumb} className="mt-0.5" />
      <HighlightedChunk
        citation={citation}
        context={120}
        className="mt-2.5 border-l-2 border-accent pl-3 text-[13px] leading-relaxed"
      />
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-rule pt-2.5 text-[12.5px]">
        <span className="text-muted">Click the marker to see the full chunk</span>
        <MdnLink href={citation.url} />
      </div>
    </div>
  );
}
