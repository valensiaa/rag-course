import { useEffect, useRef } from 'react';
import type { Conversation } from '../../types/chat';
import { isInFlight } from '../../store/chatStore';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { sourceCount } from '../../lib/copyText';
import { Icon } from '../ui/Icon';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

export function MessageList({ conversation, busy }: { conversation: Conversation; busy: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { atBottom, scrollToBottom } = useAutoScroll(scrollRef, contentRef);
  const { messages } = conversation;
  const last = messages[messages.length - 1];

  // Jump to the bottom when switching conversations or sending a new message.
  const userCount = messages.filter((m) => m.role === 'user').length;
  useEffect(() => {
    scrollToBottom('auto');
  }, [conversation.id, userCount, scrollToBottom]);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={scrollRef} className="scrollbar-thin h-full overflow-y-auto" role="log" aria-label="Conversation">
        <div ref={contentRef} className="mx-auto flex max-w-[720px] flex-col gap-8 px-4 pb-10 pt-8 sm:px-6">
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} message={m} busy={busy} />
            ) : (
              <AssistantMessage key={m.id} message={m} isLast={i === messages.length - 1} busy={busy} />
            ),
          )}
        </div>
      </div>

      {!atBottom && (
        <button
          type="button"
          onClick={() => scrollToBottom()}
          className="rise absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-rule-strong bg-surface px-3 py-1.5 text-[12.5px] font-medium text-ink shadow-pop hover:border-ink"
        >
          <Icon name="arrowDown" size={14} />
          Jump to latest
          {isInFlight(last) && <span className="size-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />}
        </button>
      )}

      <LiveStatus conversation={conversation} />
    </div>
  );
}

/** Announces coarse progress to screen readers, never individual tokens. */
function LiveStatus({ conversation }: { conversation: Conversation }) {
  const last = conversation.messages[conversation.messages.length - 1];
  let text = '';
  if (last?.role === 'assistant') {
    if (last.status === 'retrieving') text = last.retrieval ? `Found ${last.retrieval.docs.length} docs. Writing answer.` : 'Searching MDN.';
    else if (last.status === 'done') {
      const n = sourceCount(last);
      text = last.noSources ? 'Answer ready. No MDN sources found.' : `Answer ready with ${n} ${n === 1 ? 'source' : 'sources'}.`;
    } else if (last.status === 'stopped') text = 'Generation stopped.';
    else if (last.status === 'error') text = '';
  }
  return (
    <div aria-live="polite" className="sr-only">
      {text}
    </div>
  );
}
