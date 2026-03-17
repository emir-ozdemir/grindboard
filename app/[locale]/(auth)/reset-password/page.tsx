'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Loader2, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const t = useTranslations('auth');
  const params = useParams();
  const locale = params.locale as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }: { error: { message: string } | null }) => {
        if (error) setError(t('resetError'));
        else setSessionReady(true);
      });
    } else {
      // No code — might have arrived via hash tokens (implicit flow)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setSessionReady(true);
        else setError(t('resetError'));
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(t('resetError'));
    } else {
      setDone(true);
      setTimeout(() => router.push(`/${locale}/login`), 2000);
    }
  };

  return (
    <Card className="border-border/50 shadow-2xl">
      <CardHeader className="space-y-1 text-center">
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">GrindBoard</span>
          </div>
        </div>
        <CardTitle className="text-2xl">{t('resetPasswordTitle')}</CardTitle>
        <CardDescription>{t('forgotPasswordDesc')}</CardDescription>
      </CardHeader>

      <CardContent>
        {done ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="h-10 w-10 text-emerald-500" />
            <p className="text-sm font-medium">{t('resetSuccess')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">{t('newPassword')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                disabled={!sessionReady}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !sessionReady}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('resetPasswordBtn')}</>
              ) : t('resetPasswordBtn')}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="flex justify-center">
        <Link
          href={`/${locale}/login`}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {t('backToLogin')}
        </Link>
      </CardFooter>
    </Card>
  );
}
