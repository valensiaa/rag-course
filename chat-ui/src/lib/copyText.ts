import type { AssistantMessage } from '../types/chat';
import { groupByPage } from './citations';

/** Copy-friendly answer: markdown with [n] markers plus a numbered source list. */
export function answerAsMarkdown(m: AssistantMessage): string {
  if (!m.cited?.length) return m.noSources ? `${m.text}\n\n(No MDN sources.)` : m.text;
  const refs = [...m.cited].sort((a, b) => a.id - b.id).map((c) => `[${c.id}] ${c.title}: ${c.url}`);
  return `${m.text}\n\nSources:\n${refs.join('\n')}`;
}

export const sourceCount = (m: AssistantMessage) => (m.cited ? groupByPage(m.cited).length : 0);

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
