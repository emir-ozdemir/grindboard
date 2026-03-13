import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { LocaleHtml } from '@/components/layout/LocaleHtml';
import type { Locale } from '@/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isTr = locale === 'tr';
  return {
    title: isTr
      ? 'GrindBoard — Sınavlara Hazırlığın Merkezi'
      : 'GrindBoard — Your Exam Prep Hub',
    description: isTr
      ? 'Pomodoro zamanlayıcı, ders programı ve konu takibi ile çalışmalarını organize et.'
      : 'Organize your study sessions with a Pomodoro timer, weekly schedule, and topic tracker.',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <LocaleHtml locale={locale} />
        {children}
        <Toaster />
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
