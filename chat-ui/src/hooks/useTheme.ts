import { useCallback, useEffect, useState } from 'react';
import { useMediaQuery } from './useMediaQuery';

export type ThemePref = 'system' | 'light' | 'dark';

// Keep in sync with the inline script in index.html.
const KEY = 'footnote:theme';

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

export function useTheme() {
  const [pref, setPref] = useState<ThemePref>(readPref);
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)');
  const resolved = pref === 'system' ? (systemDark ? 'dark' : 'light') : pref;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [resolved]);

  const update = useCallback((next: ThemePref) => {
    setPref(next);
    try {
      if (next === 'system') localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      /* storage unavailable */
    }
  }, []);

  return { pref, resolved, setPref: update } as const;
}
