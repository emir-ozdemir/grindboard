import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Study Schedule',
  alternates: { canonical: '/schedule' },
};

export default function ScheduleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
