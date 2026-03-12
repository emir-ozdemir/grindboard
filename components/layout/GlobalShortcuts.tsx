'use client';

import { useGlobalShortcuts } from '@/lib/hooks/useGlobalShortcuts';

export function GlobalShortcuts({ locale }: { locale: string }) {
  useGlobalShortcuts(locale);
  return null;
}
