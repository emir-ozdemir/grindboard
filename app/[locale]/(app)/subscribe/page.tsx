import { createClient } from '@/lib/supabase/server';
import { SubscribePricing } from '@/components/subscribe/SubscribePricing';

export default async function SubscribePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = user
    ? await supabase.from('subscriptions').select('*').eq('user_id', user.id).single()
    : { data: null };

  const isTrialing = subscription?.status === 'trialing';

  return (
    <SubscribePricing
      subscription={subscription}
      isTrialing={isTrialing}
    />
  );
}
