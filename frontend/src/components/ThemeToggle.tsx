import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-8 h-8 flex items-center justify-center rounded-lg border border-dim text-muted hover:text-prose hover:border-accent transition-colors"
    >
      {theme === 'dark' ? <Sun size={15} strokeWidth={2} /> : <Moon size={14} strokeWidth={2} />}
    </button>
  );
}
