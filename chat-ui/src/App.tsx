import { useActiveConversation, useChatStore, useIsGenerating } from './store/chatStore';
import { useUiStore } from './store/uiStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { MessageList } from './components/chat/MessageList';
import { EmptyState } from './components/chat/EmptyState';
import { Composer } from './components/composer/Composer';
import { SourcePanel } from './components/citations/SourcePanel';

export default function App() {
  const conversation = useActiveConversation();
  const busy = useIsGenerating();
  const send = useChatStore((s) => s.send);
  const scope = useUiStore((s) => s.scope);
  useKeyboardShortcuts(busy);

  return (
    <div className="flex h-full overflow-hidden">
      <a
        href="#composer"
        className="sr-only z-50 rounded-md bg-ink px-3 py-2 text-paper focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to question box
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex min-h-0 flex-1 flex-col">
          {conversation && conversation.messages.length > 0 ? (
            <MessageList conversation={conversation} busy={busy} />
          ) : (
            <EmptyState onPick={(q) => send(q, scope)} />
          )}
          <Composer busy={busy} />
        </main>
      </div>
      <SourcePanel />
    </div>
  );
}
