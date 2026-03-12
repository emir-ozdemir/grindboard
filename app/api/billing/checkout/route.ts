import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCheckoutUrl } from '@/lib/lemonsqueezy/client';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const period = request.nextUrl.searchParams.get('period') ?? 'monthly';
  // Fall back to monthly variant if yearly is not configured
  const variantId =
    period === 'yearly' && process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_YEARLY_ID
      ? process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_YEARLY_ID
      : process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID;

  try {
    const checkoutUrl = await createCheckoutUrl(user.id, user.email ?? '', variantId);
    if (!checkoutUrl) {
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
    }
    return NextResponse.redirect(checkoutUrl);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
