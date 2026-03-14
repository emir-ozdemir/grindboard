import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// All routes requiring authentication
const protectedRoutes = [
  '/dashboard', '/pomodoro', '/schedule', '/topics', '/notes',
  '/stats', '/exams', '/settings', '/subscribe', '/goals',
];

// Routes that also require an active subscription (trialing or paid).
// /subscribe and /settings are intentionally excluded so expired users
// can still access the subscribe page and manage their account.
const subscriptionRoutes = [
  '/dashboard', '/pomodoro', '/schedule', '/topics', '/notes',
  '/stats', '/exams', '/goals',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    locales.some((locale) => pathname.startsWith(`/${locale}${route}`))
  );

  const intlResponse = intlMiddleware(request);

  if (!isProtectedRoute) {
    return intlResponse;
  }

  const supabaseResponse = intlResponse || NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) || defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Subscription gate: block access to app routes for expired / no subscription users
  const isSubscriptionRoute = subscriptionRoutes.some((route) =>
    locales.some((locale) => pathname.startsWith(`/${locale}${route}`))
  );

  if (isSubscriptionRoute) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, trial_ends_at')
      .eq('user_id', user.id)
      .single();

    const now = new Date();
    const isActive =
      subscription?.status === 'active' ||
      (subscription?.status === 'trialing' &&
        subscription.trial_ends_at != null &&
        new Date(subscription.trial_ends_at) > now);

    if (!isActive) {
      const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) || defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/subscribe`, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
