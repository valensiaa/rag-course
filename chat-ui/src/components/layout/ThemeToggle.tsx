import { useTheme, type ThemePref } from '../../hooks/useTheme';
import { Icon, type IconName } from '../ui/Icon';

const OPTIONS: { value: ThemePref; icon: IconName; label: string }[] = [
  { value: 'system', icon: 'monitor', label: 'System theme' },
  { value: 'light', icon: 'sun', label: 'Light theme' },
  { value: 'dark', icon: 'moon', label: 'Dark theme' },
];

export function ThemeToggle() {
  const { pref, setPref } = useTheme();
  return (
    <div role="group" aria-label="Theme" className="inline-flex rounded-md border border-rule p-0.5">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-label={o.label}
          aria-pressed={pref === o.value}
          title={o.label}
          onClick={() => setPref(o.value)}
          className={`inline-flex size-7 items-center justify-center rounded-[4px] transition-colors ${
            pref === o.value ? 'bg-sunken text-ink' : 'text-muted hover:text-ink'
          }`}
        >
          <Icon name={o.icon} size={14} />
        </button>
      ))}
    </div>
  );
}
