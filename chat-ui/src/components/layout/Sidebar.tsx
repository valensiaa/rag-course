import { useEffect, useMemo, useState } from 'react';
import { isMockBackend } from '../../api';
import { groupByDate } from '../../lib/dates';
import { focusComposer } from '../../lib/composerFocus';
import { useChatStore } from '../../store/chatStore';
import { useUiStore } from '../../store/uiStore';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Icon } from '../ui/Icon';
import { IconButton } from '../ui/IconButton';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

export function Brand() {
  return (
    <span className="inline-flex items-baseline gap-1.5 font-serif text-[17px] font-semibold tracking-[-0.01em]">
      Footnote
      <span className="font-mono text-[10px] font-semibold text-accent" aria-hidden="true">
        [1]
      </span>
    </span>
  );
}

export function Sidebar() {
  const open = useUiStore((s) => s.sidebarOpen);
  const setOpen = useUiStore((s) => s.setSidebarOpen);
  const isWide = useMediaQuery('(min-width: 768px)');
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const { newChat, selectConversation, deleteConversation } = useChatStore.getState();
  const closeSource = useUiStore((s) => s.closeSource);
  const [query, setQuery] = useState('');

  // Docked on wide screens; an overlay on narrow ones, so close it when shrinking.
  useEffect(() => {
    if (!isWide) setOpen(false);
  }, [isWide, setOpen]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = Object.values(conversations).filter(
      (c) =>
        c.messages.length > 0 &&
        (!q || c.title.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q))),
    );
    return groupByDate(list);
  }, [conversations, query]);

  if (!open) return null;

  const afterNavigate = () => {
    closeSource();
    if (!isWide) setOpen(false);
  };

  return (
    <>
      {!isWide && (
        <div aria-hidden="true" className="fixed inset-0 z-30 bg-black/30" onClick={() => setOpen(false)} />
      )}
      <nav
        aria-label="Chat history"
        className={`flex h-full w-[272px] shrink-0 flex-col border-r border-rule bg-paper ${
          isWide ? '' : 'fixed inset-y-0 left-0 z-40 shadow-pop'
        }`}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && !isWide) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <Brand />
          <IconButton icon="sidebar" label="Close sidebar" size="sm" onClick={() => setOpen(false)} />
        </div>

        <div className="space-y-2 px-3">
          <button
            type="button"
            onClick={() => {
              newChat();
              afterNavigate();
              requestAnimationFrame(focusComposer);
            }}
            className="flex w-full items-center gap-2 rounded-md border border-rule-strong bg-surface px-3 py-2 text-[13.5px] font-medium hover:border-ink"
          >
            <Icon name="plus" size={15} />
            New chat
            <kbd className="ml-auto font-mono text-[10.5px] text-muted">{isMac ? '⌘K' : 'Ctrl K'}</kbd>
          </button>
          <div className="relative">
            <Icon name="search" size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-muted" />
            <label htmlFor="history-search" className="sr-only">
              Search chats
            </label>
            <input
              id="history-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full rounded-md border border-rule bg-transparent py-1.5 pl-8 pr-2 text-[13px] outline-none placeholder:text-muted focus:border-ink"
            />
          </div>
        </div>

        <div className="scrollbar-thin mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          {groups.length === 0 && (
            <p className="px-2 text-[13px] text-muted">{query ? 'No chats match.' : 'Your conversations will appear here.'}</p>
          )}
          {groups.map((g) => (
            <section key={g.label} className="mb-4">
              <h2 className="eyebrow mb-1 px-2 text-muted">{g.label}</h2>
              <ul>
                {g.items.map((c) => (
                  <li key={c.id} className="group relative">
                    <button
                      type="button"
                      aria-current={c.id === activeId ? 'page' : undefined}
                      onClick={() => {
                        selectConversation(c.id);
                        afterNavigate();
                      }}
                      className={`block w-full truncate rounded-md py-1.5 pl-2 pr-8 text-left text-[13.5px] ${
                        c.id === activeId ? 'bg-sunken text-ink' : 'text-ink-2 hover:bg-sunken hover:text-ink'
                      }`}
                    >
                      {c.title}
                    </button>
                    <IconButton
                      icon="trash"
                      label={`Delete “${c.title}”`}
                      size="sm"
                      onClick={() => deleteConversation(c.id)}
                      className="absolute right-0.5 top-1/2 -translate-y-1/2 opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="border-t border-rule px-4 py-3 text-[11.5px] leading-snug text-muted">
          {isMockBackend && (
            <p className="eyebrow mb-1 text-warn-ink">
              <span aria-hidden="true">● </span>Mock backend
            </p>
          )}
          Unofficial. Not affiliated with MDN or Mozilla. Content © MDN contributors, CC-BY-SA 2.5.
        </footer>
      </nav>
    </>
  );
}
