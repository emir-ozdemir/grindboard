import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exam Countdown',
  alternates: { canonical: '/exams' },
};

export default function ExamsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
