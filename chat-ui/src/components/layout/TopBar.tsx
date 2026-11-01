import { useActiveConversation } from '../../store/chatStore';
import { useUiStore } from '../../store/uiStore';
import { IconButton } from '../ui/IconButton';
import { Brand } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';

export function TopBar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const conversation = useActiveConversation();

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-rule px-3 sm:px-4">
      {!sidebarOpen && (
        <>
          <IconButton icon="sidebar" label="Open sidebar" size="sm" onClick={toggleSidebar} />
          <span className="mr-2">
            <Brand />
          </span>
        </>
      )}
      <p className="min-w-0 flex-1 truncate text-[13.5px] text-ink-2">{conversation?.title ?? ''}</p>
      <ThemeToggle />
    </header>
  );
}
