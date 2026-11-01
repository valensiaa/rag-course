import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';

const PIN_THRESHOLD = 80;

/**
 * Keeps a scroll container pinned to the bottom while content grows, unless
 * the user has scrolled up. Returns whether we're at the bottom and a
 * function to jump back.
 */
export function useAutoScroll(
  containerRef: RefObject<HTMLElement | null>,
  contentRef: RefObject<HTMLElement | null>,
) {
  const pinned = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Content growth never moves scrollTop, so only an upward scroll can come
    // from the user. That avoids unpinning when a big block (table, code)
    // lands between our programmatic scroll and its scroll event.
    let lastTop = el.scrollTop;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      if (distance < PIN_THRESHOLD) pinned.current = true;
      else if (el.scrollTop < lastTop) pinned.current = false;
      lastTop = el.scrollTop;
      setAtBottom(distance < PIN_THRESHOLD);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef]);

  useEffect(() => {
    const el = containerRef.current;
    const content = contentRef.current;
    if (!el || !content) return;
    const ro = new ResizeObserver(() => {
      if (pinned.current) el.scrollTop = el.scrollHeight;
      setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < PIN_THRESHOLD);
    });
    ro.observe(content);
    return () => ro.disconnect();
  }, [containerRef, contentRef]);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const el = containerRef.current;
      if (!el) return;
      pinned.current = true;
      setAtBottom(true);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({ top: el.scrollHeight, behavior: reduce ? 'auto' : behavior });
    },
    [containerRef],
  );

  return { atBottom, scrollToBottom };
}
