import React from 'react';
import { SunMedium, MoonStar } from 'lucide-react';
import { useTheme } from '../theme/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <SunMedium size={18} /> : <MoonStar size={18} />}
    </button>
  );
}
