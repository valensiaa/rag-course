import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { Icon, type IconName } from './Icon';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  /** Show the label next to the icon instead of only as the accessible name. */
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { icon, label, showLabel, size = 'md', className = '', ...rest },
  ref,
) {
  const dims = size === 'sm' ? 'h-7 min-w-7 px-1.5' : 'h-9 min-w-9 px-2';
  return (
    <button
      ref={ref}
      type="button"
      aria-label={showLabel ? undefined : label}
      title={showLabel ? undefined : label}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md text-muted transition-colors hover:bg-sunken hover:text-ink disabled:pointer-events-none disabled:opacity-40 ${dims} ${className}`}
      {...rest}
    >
      <Icon name={icon} size={size === 'sm' ? 15 : 17} />
      {showLabel && <span className="text-[13px]">{label}</span>}
    </button>
  );
});
