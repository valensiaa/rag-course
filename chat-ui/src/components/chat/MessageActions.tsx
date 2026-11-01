import { useState } from 'react';
import type { AssistantMessage } from '../../types/chat';
import { answerAsMarkdown, copyToClipboard } from '../../lib/copyText';
import { useChatStore } from '../../store/chatStore';
import { IconButton } from '../ui/IconButton';

export function MessageActions({ message, disabled }: { message: AssistantMessage; disabled: boolean }) {
  const regenerate = useChatStore((s) => s.regenerate);
  const setFeedback = useChatStore((s) => s.setFeedback);
  const [copied, setCopied] = useState(false);

  return (
    <div role="toolbar" aria-label="Answer actions" className="-ml-2 mt-3 flex items-center gap-0.5">
      <IconButton
        icon={copied ? 'check' : 'copy'}
        label={copied ? 'Copied with sources' : 'Copy answer with sources'}
        size="sm"
        onClick={async () => {
          if (await copyToClipboard(answerAsMarkdown(message))) {
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }
        }}
      />
      <IconButton icon="refresh" label="Regenerate answer" size="sm" disabled={disabled} onClick={() => regenerate(message.id)} />
      <span aria-hidden="true" className="mx-1 h-4 w-px bg-rule" />
      <IconButton
        icon="thumbUp"
        label="Good answer"
        size="sm"
        aria-pressed={message.feedback === 'up'}
        className={message.feedback === 'up' ? 'text-accent' : ''}
        onClick={() => setFeedback(message.id, 'up')}
      />
      <IconButton
        icon="thumbDown"
        label="Bad answer"
        size="sm"
        aria-pressed={message.feedback === 'down'}
        className={message.feedback === 'down' ? 'text-ink' : ''}
        onClick={() => setFeedback(message.id, 'down')}
      />
      <span aria-live="polite" className="sr-only">
        {copied ? 'Answer copied' : ''}
      </span>
    </div>
  );
}
