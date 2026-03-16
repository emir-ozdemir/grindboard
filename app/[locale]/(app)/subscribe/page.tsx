import { createClient } from '@/lib/supabase/server';
import { SubscribePricing } from '@/components/subscribe/SubscribePricing';
import type { Locale } from '@/i18n/config';

export default async function SubscribePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ reason?: string }>;
}) {
  const { locale } = await params;
  const { reason } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = user
    ? await supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()
    : { data: null };

  // Show trial CTA only for users currently in trial
  const isTrialing = subscription?.status === 'trialing';
  // Came here from the subscription gate (expired or no subscription)
  const gateReason = (reason === 'expired' || reason === 'no_subscription') ? reason : null;

  return (
    <SubscribePricing
      subscription={subscription}
      isTrialing={isTrialing}
      locale={locale}
      gateReason={gateReason}
    />
  );
}
