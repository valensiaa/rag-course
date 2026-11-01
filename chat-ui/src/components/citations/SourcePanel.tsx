import { useEffect, useId, useLayoutEffect, useRef } from 'react';
import type { AssistantMessage, Citation } from '../../types/chat';
import { useChatStore } from '../../store/chatStore';
import { useUiStore } from '../../store/uiStore';
import { useIsDesktop } from '../../hooks/useMediaQuery';
import { pageKey } from '../../lib/citations';
import { STATUS_DESCRIPTION, STATUS_LABEL } from '../../lib/areas';
import { IconButton } from '../ui/IconButton';
import { Icon } from '../ui/Icon';
import { AreaTag, Breadcrumb, MdnLink, Modified, StatusBadges } from './SourceMeta';
import { HighlightedChunk } from './HighlightedChunk';

interface Resolved {
  message: AssistantMessage;
  citation: Citation;
  cited: boolean;
  /** Every chunk from the same page within this answer, cited first. */
  siblings: { citation: Citation; cited: boolean }[];
}

function useResolvedSource(): Resolved | null {
  const source = useUiStore((s) => s.source);
  const message = useChatStore((s) => {
    if (!source) return undefined;
    for (const c of Object.values(s.conversations)) {
      const m = c.messages.find((x) => x.id === source.messageId);
      if (m?.role === 'assistant') return m;
    }
    return undefined;
  });
  if (!source || !message) return null;

  const all = [
    ...(message.cited ?? []).map((citation) => ({ citation, cited: true })),
    ...message.retrievedNotCited.map((citation) => ({ citation, cited: false })),
  ];
  const hit = all.find((x) => x.citation.id === source.citationId);
  if (!hit) return null;
  const key = pageKey(hit.citation.url);
  return { message, ...hit, siblings: all.filter((x) => pageKey(x.citation.url) === key) };
}

/**
 * Shows the stored chunk the model saw. Docked on desktop, a modal bottom
 * sheet (native <dialog>) on smaller screens.
 */
export function SourcePanel() {
  const resolved = useResolvedSource();
  const close = useUiStore((s) => s.closeSource);
  const isDesktop = useIsDesktop();
  const source = useUiStore((s) => s.source);

  // Selection points at a message that no longer exists (deleted, regenerated).
  useEffect(() => {
    if (source && !resolved) close();
  }, [source, resolved, close]);

  if (!resolved) return null;
  return isDesktop ? <DockedPanel resolved={resolved} onClose={close} /> : <BottomSheet resolved={resolved} onClose={close} />;
}

function DockedPanel({ resolved, onClose }: { resolved: Resolved; onClose: () => void }) {
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);

  // Move focus into the panel when it opens or switches source.
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[data-panel-title]')?.focus({ preventScroll: true });
  }, [resolved.citation.id, resolved.message.id]);

  return (
    <aside
      ref={ref}
      aria-labelledby={titleId}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }
      }}
      className="panel-in flex h-full w-[min(440px,40vw)] shrink-0 flex-col border-l border-rule bg-surface"
    >
      <PanelBody resolved={resolved} onClose={onClose} titleId={titleId} />
    </aside>
  );
}

function BottomSheet({ resolved, onClose }: { resolved: Resolved; onClose: () => void }) {
  const titleId = useId();
  const ref = useRef<HTMLDialogElement>(null);

  useLayoutEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose(); // backdrop click
      }}
      className="sheet-in fixed inset-x-0 bottom-0 top-auto m-0 flex max-h-[85dvh] w-full max-w-none flex-col rounded-t-xl border-t border-rule-strong bg-surface p-0 text-ink shadow-pop backdrop:bg-black/40"
    >
      <div aria-hidden="true" className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-rule-strong" />
      <PanelBody resolved={resolved} onClose={onClose} titleId={titleId} />
    </dialog>
  );
}

function PanelBody({ resolved, onClose, titleId }: { resolved: Resolved; onClose: () => void; titleId: string }) {
  const { citation, cited, siblings, message } = resolved;
  const openSource = useUiStore((s) => s.openSource);
  const scrollRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLElement>(null);

  // Scroll the supporting passage into view, about a third of the way down.
  useLayoutEffect(() => {
    const box = scrollRef.current;
    const mark = markRef.current;
    if (!box) return;
    if (!mark) {
      box.scrollTop = 0;
      return;
    }
    const offset = mark.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    box.scrollTop = Math.max(0, offset - box.clientHeight / 3);
  }, [citation.id, message.id]);

  return (
    <>
      <header className="shrink-0 border-b border-rule px-5 pb-4 pt-3">
        <div className="flex items-center gap-2">
          <span className="eyebrow text-accent">
            {cited ? (
              <>
                Source <span className="font-semibold">[{citation.id}]</span>
              </>
            ) : (
              'Retrieved · not cited'
            )}
          </span>
          <IconButton icon="x" label="Close source panel" size="sm" className="-mr-1.5 ml-auto" onClick={onClose} />
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <AreaTag area={citation.area} />
          <StatusBadges status={citation.status} />
        </div>
        <h2
          id={titleId}
          data-panel-title
          tabIndex={-1}
          className="mt-1.5 font-serif text-[21px] font-semibold leading-tight tracking-[-0.01em] focus:outline-none"
        >
          {citation.title}
        </h2>
        <Breadcrumb items={citation.breadcrumb} className="mt-1" />

        {siblings.length > 1 && (
          <div className="mt-3" role="group" aria-label="Passages retrieved from this page">
            <p className="eyebrow mb-1.5 text-muted">{siblings.length} passages from this page</p>
            <div className="flex flex-wrap gap-1.5">
              {siblings.map((s) => {
                const selected = s.citation.id === citation.id;
                return (
                  <button
                    key={s.citation.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => openSource({ messageId: message.id, citationId: s.citation.id })}
                    className={`rounded-[4px] border px-2 py-0.5 font-mono text-[11.5px] transition-colors ${
                      selected
                        ? 'border-accent bg-accent text-on-accent'
                        : 'border-rule-strong text-ink-2 hover:border-accent hover:text-accent'
                    }`}
                  >
                    {s.cited ? `[${s.citation.id}]` : 'uncited'}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <div ref={scrollRef} className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {citation.status.map((s) => (
          <p
            key={s}
            className={`mb-3 flex gap-2 rounded-md border px-3 py-2 text-[13px] ${
              s === 'deprecated' ? 'border-danger-ink/30 bg-danger-bg text-danger-ink' : 'border-warn-rule bg-warn-bg text-warn-ink'
            }`}
          >
            <Icon name="alert" size={15} className="mt-0.5 shrink-0" />
            <span>
              <strong className="font-semibold">MDN marks this {STATUS_LABEL[s].toLowerCase()}.</strong> {STATUS_DESCRIPTION[s]}
            </span>
          </p>
        ))}

        <div className="mb-2">
          <p className="eyebrow text-muted">Retrieved chunk · exactly what the model saw</p>
          <p className="truncate font-mono text-[10.5px] text-muted" title={citation.chunkId}>
            <span className="sr-only">Chunk id: </span>
            {citation.chunkId}
          </p>
        </div>
        <HighlightedChunk
          ref={markRef}
          citation={citation}
          highlight={cited}
          className="rounded-md border border-rule bg-paper px-4 py-3.5 text-[14px] leading-[1.7]"
        />
        {!cited && (
          <p className="mt-2 text-[12.5px] text-muted">
            Not cited: no claim in the answer relies on this passage.
          </p>
        )}
      </div>

      <footer className="flex shrink-0 items-center gap-3 border-t border-rule px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-[13px]">
        <Modified iso={citation.lastModified} />
        <MdnLink
          href={citation.url}
          className="ml-auto rounded-md border border-accent px-3 py-1.5 hover:bg-accent hover:text-on-accent hover:no-underline"
        />
      </footer>
    </>
  );
}
