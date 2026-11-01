import { useEffect, useState } from 'react';
import type { AssistantError } from '../../types/chat';
import { Icon } from '../ui/Icon';

/** Shown on any answer that isn't backed by citations. Deliberately hard to miss. */
export function UnsourcedBanner({ reason }: { reason: 'no_sources' | 'uncited' }) {
  return (
    <div role="note" className="mb-4 flex gap-2.5 rounded-md border border-warn-rule bg-warn-bg px-3.5 py-2.5 text-warn-ink">
      <Icon name="alert" size={16} className="mt-[3px] shrink-0" />
      <div className="text-[13.5px] leading-snug">
        <p className="font-semibold">
          {reason === 'no_sources'
            ? 'No matching MDN docs found. This answer isn’t sourced.'
            : 'The model didn’t cite any retrieved MDN docs. This answer isn’t sourced.'}
        </p>
        <p className="mt-0.5 opacity-90">It comes from the model’s general knowledge. Verify it before relying on it.</p>
      </div>
    </div>
  );
}

function useCountdown(until?: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!until || until <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, [until]);
  return until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
}

export function ErrorNotice({ error, onRetry }: { error: AssistantError; onRetry: () => void }) {
  const rateLimited = error.code === 'rate_limited';
  const wait = useCountdown(error.retryAt);

  return (
    <div
      role="alert"
      className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border border-rule-strong bg-surface px-3.5 py-2.5"
    >
      <Icon
        name={rateLimited ? 'clock' : 'alert'}
        size={16}
        className={rateLimited ? 'text-warn-ink' : 'text-danger-ink'}
      />
      <div className="min-w-0 flex-1 text-[13.5px] leading-snug">
        <p className="font-semibold">{rateLimited ? 'Rate limit reached' : 'Something went wrong'}</p>
        <p className="text-ink-2">
          {error.message}
          {rateLimited && wait > 0 && <> You can try again in {wait}s.</>}
        </p>
      </div>
      {error.retryable && (
        <button
          type="button"
          onClick={onRetry}
          disabled={wait > 0}
          className="inline-flex items-center gap-1.5 rounded-md border border-rule-strong px-3 py-1.5 text-[13px] font-medium hover:border-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="refresh" size={14} />
          {wait > 0 ? `Retry in ${wait}s` : 'Retry'}
        </button>
      )}
    </div>
  );
}

export function AnswerSkeleton() {
  return (
    <div aria-hidden="true" className="mt-1 space-y-2.5">
      <div className="skeleton h-3.5 w-[92%]" />
      <div className="skeleton h-3.5 w-[86%]" />
      <div className="skeleton h-3.5 w-[60%]" />
    </div>
  );
}
