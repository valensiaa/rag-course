import type { Citation } from '../../types/chat';
import { groupByPage, type SourcePage } from '../../lib/citations';
import { useUiStore } from '../../store/uiStore';
import { AreaTag, Breadcrumb, MdnLink, Modified, StatusBadges } from './SourceMeta';

/** One card per MDN page, with every chunk from that page merged in. */
export function SourcesStrip({ messageId, cited }: { messageId: string; cited: Citation[] }) {
  const pages = groupByPage(cited);
  return (
    <section aria-label="Sources" className="mt-6">
      <h3 className="eyebrow mb-2 flex items-center gap-2 text-muted">
        <span className="text-accent">Sources</span>
        <span aria-hidden="true">·</span>
        <span>
          {pages.length} {pages.length === 1 ? 'page' : 'pages'}, {cited.length}{' '}
          {cited.length === 1 ? 'passage' : 'passages'}
        </span>
      </h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {pages.map((page) => (
          <li key={page.key}>
            <SourceCard page={page} messageId={messageId} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function SourceCard({ page, messageId }: { page: SourcePage; messageId: string }) {
  const openSource = useUiStore((s) => s.openSource);
  const activeId = useUiStore((s) => (s.source?.messageId === messageId ? s.source.citationId : null));
  const isActive = page.chunks.some((c) => c.id === activeId);
  const first = page.chunks[0];

  return (
    <article
      className={`relative h-full overflow-hidden rounded-md border bg-surface py-2.5 pl-4 pr-3 transition-colors has-[h4_button:focus-visible]:ring-2 has-[h4_button:focus-visible]:ring-accent ${
        isActive ? 'border-accent' : 'border-rule hover:border-rule-strong'
      }`}
    >
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px]" style={{ background: `var(--area-${page.area})` }} />
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <AreaTag area={page.area} />
        <StatusBadges status={page.status} />
      </div>
      <h4 className="mt-1 text-[13.5px] font-semibold leading-snug">
        {/* Stretched button: the whole card opens the first passage. */}
        <button
          type="button"
          className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          onClick={(e) => openSource({ messageId, citationId: first.id }, e.currentTarget)}
        >
          {page.title}
          <span className="sr-only">, view cited passage</span>
        </button>
      </h4>
      <Breadcrumb items={page.breadcrumb} />
      <div className="mt-2 flex items-center gap-2">
        <span className="relative z-10 flex gap-1" aria-label="Passages cited from this page" role="group">
          {page.chunks.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-label={`Passage ${c.id}`}
              onClick={(e) => openSource({ messageId, citationId: c.id }, e.currentTarget)}
              className={`h-5 min-w-5 rounded-[3px] px-1 font-mono text-[10.5px] font-semibold tabular-nums transition-colors ${
                c.id === activeId ? 'bg-accent text-on-accent' : 'bg-accent-soft text-accent-ink hover:bg-accent hover:text-on-accent'
              }`}
            >
              {c.id}
            </button>
          ))}
        </span>
        <Modified iso={page.lastModified} className="ml-auto" />
        <MdnLink href={page.url} compact className="relative z-10 text-[12px]" />
      </div>
      {isActive && <span className="sr-only">(open in source panel)</span>}
    </article>
  );
}
