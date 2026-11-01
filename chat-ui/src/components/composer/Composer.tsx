import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { registerComposer } from '../../lib/composerFocus';
import { useChatStore } from '../../store/chatStore';
import { useUiStore } from '../../store/uiStore';
import { Icon } from '../ui/Icon';
import { ScopeChips } from './ScopeChips';

const MAX_HEIGHT = 220;

export function Composer({ busy }: { busy: boolean }) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const send = useChatStore((s) => s.send);
  const stop = useChatStore((s) => s.stop);
  const scope = useUiStore((s) => s.scope);
  const setScope = useUiStore((s) => s.setScope);

  useEffect(() => {
    registerComposer({ focus: () => ref.current?.focus(), setText });
    return () => registerComposer(null);
  }, []);

  // Grow with content up to MAX_HEIGHT, then scroll.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > MAX_HEIGHT ? 'auto' : 'hidden';
  }, [text]);

  const submit = () => {
    if (busy || !text.trim()) return;
    send(text, scope);
    setText('');
  };

  return (
    <div className="shrink-0 bg-gradient-to-t from-paper from-70% to-transparent px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
      <form
        className="mx-auto max-w-[720px]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="mb-2">
          <ScopeChips value={scope} onChange={setScope} />
        </div>
        <div className="rounded-lg border border-rule-strong bg-surface shadow-[0_1px_0_var(--rule)] transition-colors focus-within:border-ink">
          <label htmlFor="composer" className="sr-only">
            Ask a question about the web platform
          </label>
          <textarea
            id="composer"
            ref={ref}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Ask about JS, CSS, HTML, Web APIs or HTTP…"
            aria-describedby="composer-hint"
            className="block w-full resize-none bg-transparent px-4 pb-1 pt-3 text-[15px] leading-6 text-ink outline-none placeholder:text-muted"
          />
          <div className="flex items-center justify-between gap-3 py-2 pl-4 pr-2">
            <p id="composer-hint" className="hidden font-mono text-[11px] text-muted sm:block">
              <Kbd>Enter</Kbd> send · <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> newline · <Kbd>/</Kbd> focus
              {busy && (
                <>
                  {' '}
                  · <Kbd>Esc</Kbd> stop
                </>
              )}
            </p>
            {busy ? (
              <button
                type="button"
                onClick={stop}
                className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-md border border-rule-strong px-3 text-[13px] font-medium text-ink hover:border-ink"
              >
                <Icon name="stop" size={13} className="fill-current" />
                Stop
              </button>
            ) : (
              <button
                type="submit"
                disabled={!text.trim()}
                aria-label="Send"
                className="ml-auto inline-flex size-8 items-center justify-center rounded-md bg-ink text-paper transition-opacity disabled:opacity-25"
              >
                <Icon name="arrowUp" size={16} />
              </button>
            )}
          </div>
        </div>
        <p className="mt-1.5 text-center text-[11.5px] text-muted">
          Answers can be wrong. Check the cited passages before you rely on them.
        </p>
      </form>
    </div>
  );
}

function Kbd({ children }: { children: string }) {
  return <kbd className="rounded-[3px] border border-rule-strong bg-paper px-1 py-px text-[10.5px] text-ink-2">{children}</kbd>;
}
