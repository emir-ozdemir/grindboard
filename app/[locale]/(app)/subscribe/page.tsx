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
    ? await supabase.from('subscriptions').select('*').eq('user_id', user.id).maybeSingle()
    : { data: null };

  // Show trial CTA only for users currently in trial
  const isTrialing = subscription?.status === 'trialing';

  return (
    <SubscribePricing
      subscription={subscription}
      isTrialing={isTrialing}
      locale={locale}
    />
  );
}
