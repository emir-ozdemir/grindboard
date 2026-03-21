import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Topic Tracking',
  alternates: { canonical: '/topics' },
};

export default function TopicsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
