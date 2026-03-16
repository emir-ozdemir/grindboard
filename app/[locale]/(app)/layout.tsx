import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { GlobalShortcuts } from '@/components/layout/GlobalShortcuts';
import { TrialBanner } from '@/components/dashboard/TrialBanner';
import type { Locale } from '@/i18n/config';

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle(),
  ]);

  return (
    <div className="flex min-h-screen bg-background">
      <GlobalShortcuts locale={locale} />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header profile={profile} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <TrialBanner subscription={subscription} />
          {children}
        </main>
      </div>
    </div>
  );
}
