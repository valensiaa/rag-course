import type { AssistantMessage as Msg } from '../../types/chat';
import { useChatStore } from '../../store/chatStore';
import { useUiStore } from '../../store/uiStore';
import { CitationProvider } from '../citations/CitationContext';
import { NotCitedList } from '../citations/NotCitedList';
import { SourcesStrip } from '../citations/SourcesStrip';
import { FollowUps } from './FollowUps';
import { MarkdownAnswer } from './MarkdownAnswer';
import { MessageActions } from './MessageActions';
import { AnswerSkeleton, ErrorNotice, UnsourcedBanner } from './Notices';
import { RetrievalStatus } from './RetrievalStatus';

export function AssistantMessage({ message, isLast, busy }: { message: Msg; isLast: boolean; busy: boolean }) {
  const regenerate = useChatStore((s) => s.regenerate);
  const send = useChatStore((s) => s.send);
  const scope = useUiStore((s) => s.scope);

  const streaming = message.status === 'streaming';
  const finished = message.status === 'done';
  const cited = message.cited ?? [];
  const unsourced = message.noSources ? 'no_sources' : finished && cited.length === 0 ? 'uncited' : null;
  const waitingForText = message.status === 'retrieving' && !!message.retrieval && !message.text;

  return (
    <article aria-label="Answer" className="rise">
      <RetrievalStatus message={message} />
      <div className={`mt-2 ${unsourced ? 'border-l-2 border-dashed border-warn-rule pl-4' : ''}`}>
        {unsourced && <UnsourcedBanner reason={unsourced} />}
        {waitingForText && <AnswerSkeleton />}
        {message.text && (
          <CitationProvider message={message}>
            <MarkdownAnswer text={message.text} streaming={streaming} muted={!!unsourced} />
          </CitationProvider>
        )}
      </div>

      {message.status === 'stopped' && (
        <p className="eyebrow mt-3 text-muted">
          Stopped{message.cited === null && message.text ? ' · citations weren’t received' : ''}
        </p>
      )}
      {message.status === 'error' && message.error && (
        <ErrorNotice error={message.error} onRetry={() => regenerate(message.id)} />
      )}

      {cited.length > 0 && <SourcesStrip messageId={message.id} cited={cited} />}
      {message.retrievedNotCited.length > 0 && <NotCitedList messageId={message.id} chunks={message.retrievedNotCited} />}

      {(finished || message.status === 'stopped') && <MessageActions message={message} disabled={busy} />}
      {isLast && finished && message.suggestions.length > 0 && (
        <FollowUps questions={message.suggestions} onPick={(q) => send(q, scope)} />
      )}
    </article>
  );
}
