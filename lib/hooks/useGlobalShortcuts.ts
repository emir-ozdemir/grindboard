'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export function useGlobalShortcuts(locale: string) {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const NAV_ROUTES = [
      `/${locale}/dashboard`,
      `/${locale}/pomodoro`,
      `/${locale}/schedule`,
      `/${locale}/topics`,
      `/${locale}/notes`,
      `/${locale}/stats`,
      `/${locale}/exams`,
    ];

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      if (target.isContentEditable) return;

      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl/Cmd+D — toggle dark/light theme
      if (ctrl && e.key === 'd') {
        e.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
        return;
      }

      // 1-6 — navigate to pages (no modifier keys)
      if (!ctrl && !e.altKey && !e.shiftKey && e.key >= '1' && e.key <= '7') {
        const route = NAV_ROUTES[parseInt(e.key, 10) - 1];
        if (route) router.push(route);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [theme, setTheme, router, locale]);
}
