import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { locales, defaultLocale } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/pomodoro', '/schedule', '/topics', '/notes', '/stats', '/exams', '/settings', '/subscribe'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this is an app route (protected)
  const isProtectedRoute = protectedRoutes.some((route) =>
    locales.some((locale) => pathname.startsWith(`/${locale}${route}`))
  );

  // Run i18n middleware first
  const intlResponse = intlMiddleware(request);

  if (!isProtectedRoute) {
    return intlResponse;
  }

  // For protected routes, check authentication
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to locale-specific login
    const locale = locales.find((l) => pathname.startsWith(`/${l}/`)) || defaultLocale;
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
