import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({
  compact = false,
  showLabel = false,
  className = '',
}) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center gap-2 rounded-full border transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
        compact ? 'p-3' : 'px-3 py-2'
      } ${
        isDark
          ? 'bg-zinc-800/80 hover:bg-zinc-700/80 text-amber-300 border-zinc-700 shadow-sm'
          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      <div className="relative w-4 h-4 flex items-center justify-center flex-shrink-0">
        <Sun
          className={`w-5 h-5 transition-all duration-300 transform absolute ${
            isDark
              ? 'opacity-100 rotate-0 scale-100 text-amber-300'
              : 'opacity-0 -rotate-90 scale-50 text-slate-400'
          }`}
        />
        <Moon
          className={`w-5 h-5 transition-all duration-300 transform absolute ${
            isDark
              ? 'opacity-0 rotate-90 scale-50 text-slate-400'
              : 'opacity-100 rotate-0 scale-100 text-slate-700'
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-bold leading-none select-none">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
