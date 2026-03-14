import { createClient } from '@/lib/supabase/server';
import { SubscribePricing } from '@/components/subscribe/SubscribePricing';
import type { Locale } from '@/i18n/config';

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = user
    ? await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
    : { data: null };

  // Show "7 Gün Ücretsiz Başla" only for brand-new users with no subscription record.
  // Anyone who already went through the trial flow (trialing/expired/cancelled) gets "Hemen Başla".
  const isTrialing = subscription !== null;

  return (
    <SubscribePricing
      subscription={subscription}
      isTrialing={isTrialing}
      locale={locale}
    />
  );
}
