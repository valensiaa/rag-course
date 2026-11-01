import type { Scope } from '../../types/chat';
import { AREAS, AREA_ORDER } from '../../lib/areas';

const OPTIONS: { value: Scope; label: string }[] = [
  { value: 'all', label: 'All' },
  ...AREA_ORDER.map((a) => ({ value: a, label: AREAS[a].short === 'Web API' ? 'Web APIs' : AREAS[a].short })),
];

/** Native radios: arrow keys move between scopes for free. */
export function ScopeChips({ value, onChange }: { value: Scope; onChange: (s: Scope) => void }) {
  return (
    <fieldset className="flex min-w-0 items-center gap-1 overflow-x-auto">
      <legend className="sr-only">Search scope</legend>
      <span aria-hidden="true" className="eyebrow mr-1 shrink-0 text-muted">
        Scope
      </span>
      {OPTIONS.map((o) => (
        <label key={o.value} className="shrink-0">
          <input
            type="radio"
            name="scope"
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            className="peer sr-only"
          />
          <span className="inline-flex h-6 cursor-pointer items-center gap-1.5 rounded-[4px] border border-transparent px-2 font-mono text-[11.5px] text-muted transition-colors hover:text-ink peer-checked:border-rule-strong peer-checked:bg-surface peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-accent">
            {o.value !== 'all' && (
              <span aria-hidden="true" className="size-1.5 rounded-[1px]" style={{ background: `var(--area-${o.value})` }} />
            )}
            {o.label}
          </span>
        </label>
      ))}
    </fieldset>
  );
}
