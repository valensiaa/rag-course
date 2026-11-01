import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Scope } from '../types/chat';

export interface SourceSelection {
  messageId: string;
  /** Citation id within the message (cited or retrieved-not-cited). */
  citationId: number;
}

interface UiState {
  scope: Scope;
  sidebarOpen: boolean;
  source: SourceSelection | null;

  setScope: (scope: Scope) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  openSource: (sel: SourceSelection, trigger?: HTMLElement | null) => void;
  closeSource: () => void;
}

/** Element that opened the source panel; focus returns to it on close. */
let sourceTrigger: HTMLElement | null = null;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      scope: 'all',
      sidebarOpen: typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches,
      source: null,

      setScope: (scope) => set({ scope }),
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      openSource: (source, trigger) => {
        if (trigger) sourceTrigger = trigger;
        set({ source });
      },
      closeSource: () => {
        set({ source: null });
        const el = sourceTrigger;
        sourceTrigger = null;
        if (el?.isConnected) requestAnimationFrame(() => el.focus());
      },
    }),
    {
      name: 'footnote:ui',
      partialize: (s) => ({ scope: s.scope }),
    },
  ),
);
