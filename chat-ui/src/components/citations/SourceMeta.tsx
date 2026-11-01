import type { DocArea, DocStatus } from '../../types/chat';
import { AREAS, STATUS_DESCRIPTION, STATUS_LABEL } from '../../lib/areas';
import { formatModified } from '../../lib/citations';

export function AreaTag({ area, className = '' }: { area: DocArea; className?: string }) {
  return (
    <span className={`eyebrow inline-flex items-center gap-1.5 text-muted ${className}`}>
      <span aria-hidden="true" className="size-2 rounded-[2px]" style={{ background: `var(--area-${area})` }} />
      {AREAS[area].short}
    </span>
  );
}

const STATUS_STYLE: Record<DocStatus, string> = {
  deprecated: 'bg-danger-bg text-danger-ink border-danger-ink/25',
  experimental: 'bg-warn-bg text-warn-ink border-warn-rule',
  'non-standard': 'bg-sunken text-ink-2 border-rule-strong',
};

export function StatusBadges({ status }: { status: DocStatus[] }) {
  if (!status.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {status.map((s) => (
        <span
          key={s}
          title={STATUS_DESCRIPTION[s]}
          className={`eyebrow rounded-[3px] border px-1.5 py-px font-medium ${STATUS_STYLE[s]}`}
        >
          {STATUS_LABEL[s]}
        </span>
      ))}
    </span>
  );
}

export function Breadcrumb({ items, className = '' }: { items: string[]; className?: string }) {
  return (
    <p className={`truncate font-mono text-[11.5px] text-muted ${className}`} title={items.join(' › ')}>
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && (
            <span aria-hidden="true" className="px-1 opacity-60">
              ›
            </span>
          )}
          {i > 0 && <span className="sr-only">, </span>}
          {item}
        </span>
      ))}
    </p>
  );
}

export function Modified({ iso, className = '' }: { iso: string; className?: string }) {
  return (
    <span className={`font-mono text-[11px] text-muted ${className}`}>
      <span className="sr-only">Last modified </span>
      <span aria-hidden="true">mod. </span>
      <time dateTime={iso}>{formatModified(iso)}</time>
    </span>
  );
}

export function MdnLink({ href, className = '', compact }: { href: string; className?: string; compact?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 font-medium text-accent underline-offset-2 hover:underline ${className}`}
    >
      {compact ? 'MDN' : 'Open on MDN'}
      <span aria-hidden="true">↗</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
