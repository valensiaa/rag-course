import { useEffect } from 'react';
import { focusComposer } from '../lib/composerFocus';
import { useChatStore } from '../store/chatStore';
import { useUiStore } from '../store/uiStore';

const isTyping = (t: EventTarget | null) =>
  t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

/**
 * Global shortcuts:
 *   ⌘K / Ctrl+K  new chat
 *   Esc          stop generating (panels and popovers handle their own Esc first)
 *   /            focus the composer
 *
 * Later: slash commands (/example, /compat) belong in the composer, not here.
 */
export function useKeyboardShortcuts(isGenerating: boolean) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useChatStore.getState().newChat();
        useUiStore.getState().closeSource();
        requestAnimationFrame(focusComposer);
        return;
      }
      if (e.key === 'Escape' && isGenerating && !e.defaultPrevented) {
        useChatStore.getState().stop();
        return;
      }
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !isTyping(e.target)) {
        e.preventDefault();
        focusComposer();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isGenerating]);
}
