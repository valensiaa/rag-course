import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { AssistantMessage, Citation } from '../../types/chat';
import { useUiStore } from '../../store/uiStore';

interface CitationCtx {
  messageId: string;
  byId: Map<number, Citation>;
  /** True once the `citations` event (or `done`) has arrived. */
  resolved: boolean;
  /** Citation currently open in the source panel for this message, if any. */
  activeId: number | null;
}

const Ctx = createContext<CitationCtx | null>(null);

export function CitationProvider({ message, children }: { message: AssistantMessage; children: ReactNode }) {
  const source = useUiStore((s) => s.source);
  const activeId = source?.messageId === message.id ? source.citationId : null;
  const value = useMemo<CitationCtx>(
    () => ({
      messageId: message.id,
      byId: new Map((message.cited ?? []).map((c) => [c.id, c])),
      resolved: message.cited !== null,
      activeId,
    }),
    [message.id, message.cited, activeId],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCitations(): CitationCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useCitations must be used inside <CitationProvider>');
  return ctx;
}
