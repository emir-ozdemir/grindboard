import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { defaultLocale } from '@/i18n/config';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const redirectTo = next ?? null;
      if (redirectTo) return NextResponse.redirect(`${origin}${redirectTo}`);

      // Detect locale from next-intl cookie
      const localeCookie = request.headers.get('cookie') ?? '';
      const match = localeCookie.match(/NEXT_LOCALE=([^;]+)/);
      const locale = match?.[1] ?? defaultLocale;
      return NextResponse.redirect(`${origin}/${locale}/reset-password`);
    }
  }

  return NextResponse.redirect(`${origin}/`);
}
