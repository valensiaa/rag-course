import { useState } from 'react';
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import type { Citation } from '../../types/chat';
import { useUiStore } from '../../store/uiStore';
import { STATUS_LABEL } from '../../lib/areas';
import { useCitations } from './CitationContext';
import { CitationPreview } from './CitationPreview';

const base =
  'relative mx-px inline-flex h-[1.5em] min-w-[1.5em] items-center justify-center rounded-[3px] px-[0.35em] align-[0.3em] font-mono text-[0.68em] font-semibold leading-none tabular-nums';

/**
 * Inline `[n]` footnote marker. Hover or keyboard focus shows a preview card;
 * click opens the full chunk in the source panel.
 */
export function CitationChip({ id }: { id: number }) {
  const { byId, resolved, messageId, activeId } = useCitations();
  const citation = byId.get(id);

  if (!citation) {
    // Citations arrive after the text streams. Until then the marker is inert.
    return (
      <span
        className={`${base} ${resolved ? 'border border-dashed border-danger-ink/50 text-danger-ink' : 'bg-sunken text-muted'}`}
        title={resolved ? `Citation ${id} has no matching source` : undefined}
      >
        <span aria-hidden="true">{id}</span>
        <span className="sr-only">{resolved ? `[citation ${id}: source missing]` : `[citation ${id}, loading]`}</span>
      </span>
    );
  }

  return <ResolvedChip id={id} messageId={messageId} active={activeId === id} citation={citation} />;
}

function ResolvedChip({
  id,
  messageId,
  active,
  citation,
}: {
  id: number;
  messageId: string;
  active: boolean;
  citation: Citation;
}) {
  const openSource = useUiStore((s) => s.openSource);
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'top',
    middleware: [offset(8), flip({ padding: 12 }), shift({ padding: 12 })],
    whileElementsMounted: autoUpdate,
  });
  const hover = useHover(context, { mouseOnly: true, delay: { open: 140, close: 90 }, handleClose: safePolygon() });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'dialog' });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);
  const { isMounted, styles } = useTransitionStyles(context, {
    duration: { open: 140, close: 90 },
    initial: { opacity: 0, transform: 'translateY(3px)' },
  });

  const deprecated = citation.status.includes('deprecated');
  const statusText = citation.status.length ? ` (${citation.status.map((s) => STATUS_LABEL[s]).join(', ')})` : '';

  return (
    <>
      <button
        ref={refs.setReference}
        type="button"
        data-citation-id={id}
        aria-label={`Source ${id}: ${citation.title}${statusText}`}
        className={`${base} cursor-pointer transition-colors ${
          active || open
            ? 'bg-accent text-on-accent'
            : 'bg-accent-soft text-accent-ink hover:bg-accent hover:text-on-accent'
        }`}
        {...getReferenceProps({
          onClick: (e) => {
            setOpen(false);
            openSource({ messageId, citationId: id }, e.currentTarget as HTMLElement);
          },
        })}
      >
        {id}
        {deprecated && (
          <span
            aria-hidden="true"
            className="absolute -right-[3px] -top-[3px] size-[6px] rounded-full bg-danger-ink ring-2 ring-paper"
          />
        )}
      </button>
      {isMounted && (
        <FloatingPortal>
          <FloatingFocusManager context={context} modal={false} initialFocus={-1} returnFocus={false}>
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              aria-label={`Preview of source ${id}`}
              className="z-50"
              {...getFloatingProps()}
            >
              <div style={styles}>
                <CitationPreview citation={citation} />
              </div>
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}
