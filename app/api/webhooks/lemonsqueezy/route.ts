import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import crypto from 'crypto';
import type { NextRequest } from 'next/server';

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const rawBody = await request.text();
  const headersList = await headers();
  const signature = headersList.get('X-Signature') || '';
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET || '';

  if (!verifySignature(rawBody, signature, secret)) {
    return new Response('Invalid signature', { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const eventName = event.meta?.event_name;
  const data = event.data?.attributes;
  const userId = event.meta?.custom_data?.user_id;

  if (!userId) {
    return new Response('No user_id in custom_data', { status: 400 });
  }

  const subscriptionId = data?.id || event.data?.id;
  const status = data?.status;

  switch (eventName) {
    case 'subscription_created':
    case 'subscription_updated':
      await supabase.from('subscriptions').upsert({
        user_id: userId,
        lemonsqueezy_subscription_id: String(subscriptionId),
        status: status === 'on_trial' ? 'trialing' : status === 'active' ? 'active' : 'expired',
        current_period_start: data?.current_period_start,
        current_period_end: data?.current_period_end,
        trial_ends_at: data?.trial_ends_at,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
      break;

    case 'subscription_cancelled':
      await supabase.from('subscriptions').update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
      break;

    case 'subscription_expired':
      await supabase.from('subscriptions').update({
        status: 'expired',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId);
      break;
  }

  return new Response('OK', { status: 200 });
}
