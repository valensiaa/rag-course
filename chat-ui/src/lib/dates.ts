import type { Conversation } from '../types/chat';

export interface ConversationGroup {
  label: string;
  items: Conversation[];
}

const DAY = 86_400_000;

export function groupByDate(conversations: Conversation[], now = Date.now()): ConversationGroup[] {
  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const buckets: ConversationGroup[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 days', items: [] },
    { label: 'Previous 30 days', items: [] },
    { label: 'Older', items: [] },
  ];
  const sorted = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  for (const c of sorted) {
    const t = c.updatedAt;
    const i = t >= startOfToday ? 0 : t >= startOfToday - DAY ? 1 : t >= startOfToday - 7 * DAY ? 2 : t >= startOfToday - 30 * DAY ? 3 : 4;
    buckets[i].items.push(c);
  }
  return buckets.filter((b) => b.items.length > 0);
}
