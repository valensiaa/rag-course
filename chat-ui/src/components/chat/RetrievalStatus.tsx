import { useId, useState } from 'react';
import type { AssistantMessage } from '../../types/chat';
import { Icon, Spinner } from '../ui/Icon';
import { AreaTag } from '../citations/SourceMeta';

/** "Searching MDN… → Found 6 docs", expandable to list what was retrieved. */
export function RetrievalStatus({ message }: { message: AssistantMessage }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const { retrieval } = message;

  if (!retrieval) {
    if (message.status !== 'retrieving') return null;
    return (
      <p className="eyebrow flex h-7 items-center gap-2 text-muted">
        <Spinner size={12} />
        Searching MDN…
      </p>
    );
  }

  const n = retrieval.docs.length;
  if (n === 0) {
    return (
      <p className="eyebrow flex h-7 items-center gap-2 text-muted">
        <Icon name="search" size={12} />
        Searched MDN · no matching docs
      </p>
    );
  }

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="eyebrow flex h-7 items-center gap-2 rounded-sm text-muted hover:text-ink"
      >
        <Icon name="search" size={12} />
        Searched MDN · found {n} {n === 1 ? 'doc' : 'docs'}
        <Icon name="chevronDown" size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <div id={listId} hidden={!open} className="mb-3 mt-1 rounded-md border border-rule bg-surface px-3 py-2.5">
        <p className="mb-2 font-mono text-[11.5px] text-muted">
          query: <span className="text-ink-2">{retrieval.query}</span>
        </p>
        <ol className="space-y-1">
          {retrieval.docs.map((d) => (
            <li key={d.url} className="flex items-baseline gap-3 text-[13px]">
              <AreaTag area={d.area} className="w-16 shrink-0" />
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 truncate text-ink-2 hover:text-ink hover:underline"
              >
                {d.title}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
