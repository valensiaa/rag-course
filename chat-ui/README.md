# Footnote: chat UI for the MDN Docs RAG chatbot

The front end for a retrieval-augmented chatbot that answers questions about MDN Web Docs.
Every claim links back to the MDN passage it came from.

React 19 · TypeScript · Vite · Tailwind CSS v4 · zustand · react-markdown · Floating UI · prism-react-renderer

```bash
npm install
npm run dev        # http://localhost:5173, served by the in-browser mock backend
npm test           # vitest: citation parsing, page merging, mock scenarios
npm run build
```

## Backend seam

All network access goes through one function in [`src/api/index.ts`](src/api/index.ts):

```ts
streamChat(req: ChatRequest, signal: AbortSignal): AsyncIterable<StreamEvent>
```

- **Default:** `src/api/mock/` streams scripted events with realistic delays.
- **Real backend:** set `VITE_API_URL` (for example in `.env.local`). The client calls `POST {VITE_API_URL}/chat`
  with a `ChatRequest` JSON body and expects **newline-delimited JSON**, one `StreamEvent` per line
  (`src/api/httpClient.ts`). An HTTP 429 response is mapped to the rate-limit state, and the client reads `Retry-After`.

The data contract is defined in [`src/types/chat.ts`](src/types/chat.ts). It adds one *optional* field to the
`error` event: `code: 'rate_limited'` plus `retryAfterSeconds`. With it, the UI shows a countdown instead of a
generic error.

### Mock scenarios

| Ask… | You get |
| --- | --- |
| How does `Array.prototype.map()` handle sparse arrays? | JS answer, 5 citations (two from the same page), a table and code |
| How do I lay out a page with `grid-template-areas`? | CSS answer with code blocks; an *experimental* doc in "not cited" |
| How do I copy text to the clipboard? | Cites the **deprecated** `document.execCommand()` |
| no-cache vs no-store in Cache-Control? | **Fails mid-stream the first time** (retryable), then succeeds |
| Which state management library should I use with React? | **No-sources** answer |
| anything else | No-sources fallback |
| message containing `#ratelimit` / `#error` | Rate-limit countdown / retryable error |

Scope filtering is simulated too. If you ask the JS question with scope **CSS**, retrieval finds nothing.

## Layout

```
src/
  api/                 backend seam (index.ts), HTTP client, mock/
  types/chat.ts        data contract + client message state
  store/chatStore.ts   conversations, streaming, stop/regenerate/edit (persisted to localStorage)
  store/uiStore.ts     scope, sidebar, source-panel selection (+ focus return)
  lib/remarkCitations  remark plugin: [n] → <cite-ref> → <CitationChip>
  lib/citations.ts     merge chunks by page, split chunk around highlight
  components/
    chat/        MessageList, AssistantMessage, UserMessage, MarkdownAnswer, CodeBlock,
                 RetrievalStatus, Notices (unsourced banner, errors, skeleton),
                 MessageActions, FollowUps, EmptyState
    citations/   CitationChip, CitationPreview, SourcesStrip, NotCitedList, SourcePanel,
                 HighlightedChunk, SourceMeta (area tag, status badges, breadcrumb, dates)
    composer/    Composer, ScopeChips
    layout/      Sidebar, TopBar, ThemeToggle
```

## Planned features and where they plug in

- **Two-way highlighting / uncited-sentence marker:** add a remark plugin next to `remarkCitations`
  that wraps sentences in spans. Each sentence carries the `data-citation-id`s of the chips it contains.
  Hover state belongs in `uiStore`.
- **Compat tables:** a new `StreamEvent` variant (e.g. `compat`), rendered in `AssistantMessage`
  between the answer and `SourcesStrip`.
- **Runnable "Try it" blocks:** wrap `CodeBlock`. The markdown `pre` mapping already passes `lang` and `code`.
- **Slash commands:** handle them in `Composer`'s `onKeyDown`. Global shortcuts deliberately live in `useKeyboardShortcuts`.

## Keyboard

`⌘K` / `Ctrl+K` new chat · `/` focus the composer · `Esc` stop generating (or close the source panel / preview) ·
`Enter` send · `Shift+Enter` newline. Tabbing to a citation shows its preview, and the next `Tab` moves into the
preview's "Open on MDN" link.

Unofficial project. Not affiliated with MDN or Mozilla.
