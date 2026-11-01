import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { streamChat } from '../api';
import { uid } from '../lib/id';
import type {
  AssistantMessage,
  ChatRequest,
  Conversation,
  Message,
  Scope,
  StreamEvent,
  UserMessage,
} from '../types/chat';

interface ChatState {
  conversations: Record<string, Conversation>;
  /** null = a fresh, not-yet-created conversation (the empty state). */
  activeId: string | null;

  newChat: () => void;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  send: (text: string, scope: Scope) => void;
  stop: () => void;
  /** Re-run the request that produced an assistant message (retry + regenerate). */
  regenerate: (assistantId: string) => void;
  editAndResend: (userMessageId: string, text: string) => void;
  setFeedback: (assistantId: string, value: AssistantMessage['feedback']) => void;
}

/** In-flight streams, keyed by assistant message id. Not part of persisted state. */
const controllers = new Map<string, AbortController>();

const emptyAssistant = (): AssistantMessage => ({
  id: uid('a'),
  role: 'assistant',
  createdAt: Date.now(),
  status: 'retrieving',
  text: '',
  cited: null,
  retrievedNotCited: [],
  suggestions: [],
  noSources: false,
});

export const isInFlight = (m: Message | undefined) =>
  m?.role === 'assistant' && (m.status === 'retrieving' || m.status === 'streaming');

const titleFrom = (text: string) => {
  const line = text.trim().split('\n')[0];
  return line.length > 64 ? `${line.slice(0, 61)}…` : line;
};

/** localStorage writes are debounced so streaming doesn't serialise state on every token. */
const debouncedStorage: StateStorage = (() => {
  const timers = new Map<string, ReturnType<typeof setTimeout>>();
  return {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
      clearTimeout(timers.get(name));
      timers.set(name, setTimeout(() => localStorage.setItem(name, value), 400));
    },
    removeItem: (name) => localStorage.removeItem(name),
  };
})();

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => {
      /** Immutably patch one assistant message. */
      const patch = (
        convId: string,
        msgId: string,
        fn: (m: AssistantMessage) => Partial<AssistantMessage>,
      ) =>
        set((s) => {
          const conv = s.conversations[convId];
          if (!conv) return s;
          return {
            conversations: {
              ...s.conversations,
              [convId]: {
                ...conv,
                messages: conv.messages.map((m) => (m.id === msgId && m.role === 'assistant' ? { ...m, ...fn(m) } : m)),
              },
            },
          };
        });

      const apply = (convId: string, msgId: string, ev: StreamEvent): boolean => {
        switch (ev.type) {
          case 'retrieval':
            patch(convId, msgId, () => ({ retrieval: { query: ev.query, docs: ev.docs } }));
            return false;
          case 'token':
            patch(convId, msgId, (m) => ({ text: m.text + ev.text, status: 'streaming' }));
            return false;
          case 'citations':
            patch(convId, msgId, () => ({ cited: ev.cited, retrievedNotCited: ev.retrievedNotCited }));
            return false;
          case 'suggestions':
            patch(convId, msgId, () => ({ suggestions: ev.questions }));
            return false;
          case 'no_sources':
            patch(convId, msgId, () => ({ noSources: true }));
            return false;
          case 'error':
            patch(convId, msgId, () => ({
              status: 'error',
              error: {
                message: ev.message,
                retryable: ev.retryable,
                code: ev.code,
                retryAt: ev.retryAfterSeconds ? Date.now() + ev.retryAfterSeconds * 1000 : undefined,
              },
            }));
            return true;
          case 'done':
            patch(convId, msgId, (m) => ({ status: 'done', cited: m.cited ?? [] }));
            return true;
        }
      };

      const run = async (convId: string, msgId: string, req: ChatRequest) => {
        const ctrl = new AbortController();
        controllers.set(msgId, ctrl);
        try {
          for await (const ev of streamChat(req, ctrl.signal)) {
            if (apply(convId, msgId, ev)) return;
          }
          // Stream closed without `done`: finalise whatever arrived.
          patch(convId, msgId, (m) => (isInFlight(m) ? { status: 'done', cited: m.cited ?? [] } : {}));
        } catch (err) {
          if (ctrl.signal.aborted) {
            patch(convId, msgId, () => ({ status: 'stopped' }));
          } else {
            patch(convId, msgId, () => ({
              status: 'error',
              error: { message: err instanceof Error ? err.message : 'Network error', retryable: true },
            }));
          }
        } finally {
          controllers.delete(msgId);
        }
      };

      const activeIsBusy = () => {
        const { activeId, conversations } = get();
        return activeId ? conversations[activeId]?.messages.some(isInFlight) : false;
      };

      const setMessages = (convId: string, messages: Message[]) =>
        set((s) => ({
          conversations: {
            ...s.conversations,
            [convId]: { ...s.conversations[convId], messages, updatedAt: Date.now() },
          },
        }));

      return {
        conversations: {},
        activeId: null,

        newChat: () => set({ activeId: null }),

        selectConversation: (id) => set({ activeId: id }),

        deleteConversation: (id) =>
          set((s) => {
            s.conversations[id]?.messages.forEach((m) => controllers.get(m.id)?.abort());
            const { [id]: _removed, ...rest } = s.conversations;
            return { conversations: rest, activeId: s.activeId === id ? null : s.activeId };
          }),

        send: (raw, scope) => {
          const text = raw.trim();
          if (!text || activeIsBusy()) return;

          let convId = get().activeId;
          if (!convId || !get().conversations[convId]) {
            convId = uid('c');
            const now = Date.now();
            set((s) => ({
              activeId: convId,
              conversations: {
                ...s.conversations,
                [convId!]: { id: convId!, title: titleFrom(text), createdAt: now, updatedAt: now, messages: [] },
              },
            }));
          }

          const user: UserMessage = { id: uid('u'), role: 'user', text, scope, createdAt: Date.now() };
          const assistant = emptyAssistant();
          setMessages(convId, [...get().conversations[convId].messages, user, assistant]);
          void run(convId, assistant.id, { conversationId: convId, message: text, scope });
        },

        stop: () => {
          const { activeId, conversations } = get();
          if (!activeId) return;
          conversations[activeId]?.messages.forEach((m) => controllers.get(m.id)?.abort());
        },

        regenerate: (assistantId) => {
          if (activeIsBusy()) return;
          const conv = Object.values(get().conversations).find((c) => c.messages.some((m) => m.id === assistantId));
          if (!conv) return;
          const i = conv.messages.findIndex((m) => m.id === assistantId);
          const user = conv.messages
            .slice(0, i)
            .reverse()
            .find((m): m is UserMessage => m.role === 'user');
          if (!user) return;

          const fresh = { ...emptyAssistant(), id: assistantId };
          setMessages(conv.id, conv.messages.map((m) => (m.id === assistantId ? fresh : m)));
          void run(conv.id, assistantId, { conversationId: conv.id, message: user.text, scope: user.scope });
        },

        editAndResend: (userMessageId, raw) => {
          const text = raw.trim();
          if (!text || activeIsBusy()) return;
          const conv = Object.values(get().conversations).find((c) => c.messages.some((m) => m.id === userMessageId));
          if (!conv) return;
          const i = conv.messages.findIndex((m) => m.id === userMessageId);
          const user = conv.messages[i] as UserMessage;
          const assistant = emptyAssistant();
          // Editing a turn discards everything after it, like other chat apps.
          setMessages(conv.id, [...conv.messages.slice(0, i), { ...user, text }, assistant]);
          void run(conv.id, assistant.id, { conversationId: conv.id, message: text, scope: user.scope });
        },

        setFeedback: (assistantId, value) => {
          const conv = Object.values(get().conversations).find((c) => c.messages.some((m) => m.id === assistantId));
          if (conv) patch(conv.id, assistantId, (m) => ({ feedback: m.feedback === value ? undefined : value }));
        },
      };
    },
    {
      name: 'footnote:chats',
      version: 1,
      storage: createJSONStorage(() => debouncedStorage),
      partialize: (s) => ({ conversations: s.conversations, activeId: s.activeId }),
      // A reload kills in-flight streams; mark them as stopped rather than spinning forever.
      merge: (persisted, current) => {
        const p = persisted as Partial<ChatState> | undefined;
        const conversations = Object.fromEntries(
          Object.entries(p?.conversations ?? {}).map(([id, c]) => [
            id,
            {
              ...c,
              messages: c.messages.map((m) => (isInFlight(m) ? { ...m, status: 'stopped' as const } : m)),
            },
          ]),
        );
        return { ...current, conversations, activeId: p?.activeId ?? null };
      },
    },
  ),
);

/** Selectors */
export const useActiveConversation = () =>
  useChatStore((s) => (s.activeId ? s.conversations[s.activeId] : undefined));

export const useIsGenerating = () =>
  useChatStore((s) => (s.activeId ? (s.conversations[s.activeId]?.messages.some(isInFlight) ?? false) : false));
