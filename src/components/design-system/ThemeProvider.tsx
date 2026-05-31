'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/theme';

/**
 * ThemeProvider - Applies theme class to document root
 * Must be placed at app root level
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

export default ThemeProvider;