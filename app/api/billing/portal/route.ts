import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('lemonsqueezy_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!sub?.lemonsqueezy_subscription_id) {
    return NextResponse.redirect(new URL('/subscribe', process.env.NEXT_PUBLIC_APP_URL));
  }

  try {
    const res = await fetch(
      `https://api.lemonsqueezy.com/v1/subscriptions/${sub.lemonsqueezy_subscription_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
          Accept: 'application/vnd.api+json',
        },
      },
    );
    const data = await res.json();
    const portalUrl: string | undefined = data?.data?.attributes?.urls?.customer_portal;
    if (portalUrl) return NextResponse.redirect(portalUrl);
  } catch {
    // fall through to default
  }

  return NextResponse.redirect('https://app.lemonsqueezy.com/my-orders');
}
