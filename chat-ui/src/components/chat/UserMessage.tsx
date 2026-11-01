import { useEffect, useRef, useState } from 'react';
import type { UserMessage as Msg } from '../../types/chat';
import { AREAS } from '../../lib/areas';
import { copyToClipboard } from '../../lib/copyText';
import { useChatStore } from '../../store/chatStore';
import { IconButton } from '../ui/IconButton';

export function UserMessage({ message, busy }: { message: Msg; busy: boolean }) {
  const editAndResend = useChatStore((s) => s.editAndResend);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.text);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) return;
    const el = inputRef.current;
    el?.focus();
    el?.setSelectionRange(el.value.length, el.value.length);
  }, [editing]);

  if (editing) {
    const save = () => {
      setEditing(false);
      if (draft.trim() && draft.trim() !== message.text) editAndResend(message.id, draft);
    };
    return (
      <form
        className="ml-auto w-full max-w-[85%] rounded-lg border border-rule-strong bg-surface p-2"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="sr-only" htmlFor={`edit-${message.id}`}>
          Edit message
        </label>
        <textarea
          id={`edit-${message.id}`}
          ref={inputRef}
          value={draft}
          rows={Math.min(8, draft.split('\n').length + 1)}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              setEditing(false);
              setDraft(message.text);
            }
            if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              save();
            }
          }}
          className="w-full resize-none bg-transparent px-2 py-1 text-[15px] outline-none"
        />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setEditing(false);
              setDraft(message.text);
            }}
            className="rounded-md px-3 py-1.5 text-[13px] text-muted hover:bg-sunken hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !draft.trim()}
            className="rounded-md bg-ink px-3 py-1.5 text-[13px] font-medium text-paper disabled:opacity-40"
          >
            Save & resend
          </button>
        </div>
        <p className="mt-1 px-2 text-[12px] text-muted">Resending replaces the answers below this message.</p>
      </form>
    );
  }

  return (
    <div className="group flex flex-col items-end">
      <div className="max-w-[85%] whitespace-pre-wrap rounded-lg rounded-br-sm border border-rule bg-sunken px-3.5 py-2 text-[15px] text-ink">
        {message.text}
      </div>
      <div className="mt-1 flex items-center gap-0.5 opacity-100 transition-opacity sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
        {message.scope !== 'all' && (
          <span className="eyebrow mr-1 text-muted">scope: {AREAS[message.scope].short}</span>
        )}
        <IconButton icon="copy" label="Copy message" size="sm" onClick={() => copyToClipboard(message.text)} />
        <IconButton icon="pencil" label="Edit message" size="sm" disabled={busy} onClick={() => setEditing(true)} />
      </div>
    </div>
  );
}
