// ── Backend data contract ───────────────────────────────────────────────
// Shared with the retrieval/LLM backend. Keep in sync with the server.

export type DocArea = 'js' | 'css' | 'html' | 'webapi' | 'http';
export type DocStatus = 'deprecated' | 'experimental' | 'non-standard';
export type Scope = 'all' | DocArea;

export interface Citation {
  id: number; // matches the [n] marker in the answer text
  chunkId: string;
  url: string; // developer.mozilla.org URL
  title: string; // e.g. "Array.prototype.map()"
  breadcrumb: string[]; // e.g. ["JavaScript", "Reference", "Array"]
  area: DocArea;
  chunkText: string; // full stored chunk shown in the source panel
  highlight: { start: number; end: number }; // supporting passage within chunkText
  status: DocStatus[];
  lastModified: string; // ISO date
}

export type RetrievedDoc = Pick<Citation, 'title' | 'url' | 'area'>;

export type StreamEvent =
  | { type: 'retrieval'; query: string; docs: RetrievedDoc[] }
  | { type: 'token'; text: string } // answer text, may contain [n] markers
  | { type: 'citations'; cited: Citation[]; retrievedNotCited: Citation[] }
  | { type: 'suggestions'; questions: string[] }
  | { type: 'no_sources' }
  | {
      type: 'error';
      message: string;
      retryable: boolean;
      // Optional extension (not in the original contract): lets the UI show a
      // dedicated rate-limit state with a countdown. Backends may omit it.
      code?: 'rate_limited';
      retryAfterSeconds?: number;
    }
  | { type: 'done' };

export interface ChatRequest {
  conversationId: string;
  message: string;
  scope: Scope;
}

// ── Client-side state ────────────────────────────────────────────────────

export interface UserMessage {
  id: string;
  role: 'user';
  text: string;
  scope: Scope;
  createdAt: number;
}

export type AssistantStatus = 'retrieving' | 'streaming' | 'done' | 'stopped' | 'error';

export interface AssistantError {
  message: string;
  retryable: boolean;
  code?: 'rate_limited';
  /** Epoch ms after which a retry is allowed (rate limits). */
  retryAt?: number;
}

export interface AssistantMessage {
  id: string;
  role: 'assistant';
  createdAt: number;
  status: AssistantStatus;
  retrieval?: { query: string; docs: RetrievedDoc[] };
  text: string;
  /** null until the `citations` event arrives. */
  cited: Citation[] | null;
  retrievedNotCited: Citation[];
  suggestions: string[];
  noSources: boolean;
  error?: AssistantError;
  feedback?: 'up' | 'down';
}

export type Message = UserMessage | AssistantMessage;

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}
