/**
 * The single seam between the UI and the backend.
 *
 * Everything in the app talks to `streamChat`. By default it is served by the
 * in-browser mock; set `VITE_API_URL` (e.g. in `.env.local`) to switch to the
 * real HTTP backend without touching any component.
 */
import type { ChatRequest, StreamEvent } from '../types/chat';
import { httpStreamChat } from './httpClient';
import { mockStreamChat } from './mock/mockClient';

export type StreamChat = (req: ChatRequest, signal: AbortSignal) => AsyncIterable<StreamEvent>;

const apiUrl = import.meta.env.VITE_API_URL as string | undefined;

export const streamChat: StreamChat = apiUrl
  ? (req, signal) => httpStreamChat(apiUrl, req, signal)
  : mockStreamChat;

export const isMockBackend = !apiUrl;
