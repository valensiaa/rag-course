import { useId, useState } from 'react';
import type { Citation } from '../../types/chat';
import { groupByPage } from '../../lib/citations';
import { useUiStore } from '../../store/uiStore';
import { Icon } from '../ui/Icon';
import { AreaTag, MdnLink, StatusBadges } from './SourceMeta';

/** Collapsed list of docs the model was shown but didn't cite. */
export function NotCitedList({ messageId, chunks }: { messageId: string; chunks: Citation[] }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const openSource = useUiStore((s) => s.openSource);
  const pages = groupByPage(chunks);

  return (
    <div className="mt-3">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="eyebrow inline-flex items-center gap-1.5 rounded-sm py-1 text-muted hover:text-ink"
      >
        <Icon name="chevronRight" size={12} className={`transition-transform ${open ? 'rotate-90' : ''}`} />
        Also retrieved, not cited · {pages.length}
      </button>
      <div id={listId} hidden={!open}>
        <p className="mb-1.5 mt-1 text-[12.5px] text-muted">
          The model was shown these passages but didn’t use them in the answer.
        </p>
        <ul className="divide-y divide-rule border-y border-rule">
          {pages.map((page) => (
            <li key={page.key} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-[13px]">
              <AreaTag area={page.area} className="w-16 shrink-0" />
              <button
                type="button"
                className="min-w-0 truncate text-left text-ink-2 underline decoration-rule-strong underline-offset-2 hover:text-ink hover:decoration-ink"
                onClick={(e) => openSource({ messageId, citationId: page.chunks[0].id }, e.currentTarget)}
              >
                {page.title}
                <span className="sr-only">, view retrieved passage</span>
              </button>
              <StatusBadges status={page.status} />
              <MdnLink href={page.url} compact className="ml-auto text-[12px]" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
