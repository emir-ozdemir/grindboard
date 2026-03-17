import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// All routes that require authentication
const protectedRoutes = [
  '/dashboard', '/pomodoro', '/schedule', '/topics', '/notes',
  '/stats', '/exams', '/settings', '/subscribe', '/goals',
];

// Auth-required routes that bypass the subscription gate
const subscriptionFreeRoutes = ['/subscribe', '/settings'];

// Subscription statuses that grant access
const ACTIVE_STATUSES = ['trialing', 'active', 'paused', 'cancelled', 'gifted'];

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

  // Subscription gate — skip for subscribe & settings pages
  const isSubscriptionFree = subscriptionFreeRoutes.some((route) =>
    locales.some((locale) => pathname.startsWith(`/${locale}${route}`))
  );

  if (!isSubscriptionFree) {
    try {
      // Use service role key to bypass RLS for subscription check
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/subscriptions?user_id=eq.${user.id}&select=status&limit=1`,
        {
          headers: {
            apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
          },
          cache: 'no-store',
        }
      );
      const rows: { status: string }[] = await res.json();
      const status = rows?.[0]?.status;

      if (!status || !ACTIVE_STATUSES.includes(status)) {
        const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) || defaultLocale;
        const reason = !status ? 'no_subscription' : 'expired';
        return NextResponse.redirect(new URL(`/${locale}/subscribe?reason=${reason}`, request.url));
      }
    } catch {
      // Fail open on errors — don't block legitimate users
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/|auth/).*)',
  ],
};
