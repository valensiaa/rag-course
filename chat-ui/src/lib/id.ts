export const uid = (prefix: string) =>
  `${prefix}_${(crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).replace(/-/g, '').slice(0, 12)}`;
