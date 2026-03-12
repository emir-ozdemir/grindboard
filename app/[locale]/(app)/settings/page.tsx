'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Sun, Moon, Monitor, Trash2, Calendar, Zap, ArrowRight,
  CreditCard, CheckCircle2, Clock, AlertCircle,
} from 'lucide-react';
import type { Profile, Subscription } from '@/types/database';

// ─── Subscription Widget ───────────────────────────────────────────────────────

function SubscriptionWidget({
  subscription,
  locale,
}: {
  subscription: Subscription | null;
  locale: string;
}) {
  const t = useTranslations('settings');
  const tSub = useTranslations('subscription');
  const router = useRouter();

  if (!subscription) {
    return (
      <div className="rounded-2xl border border-white/[0.07] bg-card/60 backdrop-blur-sm overflow-hidden">
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('subscription')}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">{tSub('notFound')}</p>
          <button
            onClick={() => router.push(`/${locale}/subscribe`)}
            className="w-full py-2.5 rounded-xl btn-gradient text-sm font-semibold text-white"
          >
            {tSub('subscribeNow')}
          </button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const isTrialing = subscription.status === 'trialing';
  const isActive = subscription.status === 'active';

  // Detect yearly vs monthly by period length
  const isYearly =
    subscription.current_period_start && subscription.current_period_end
      ? new Date(subscription.current_period_end).getTime() -
          new Date(subscription.current_period_start).getTime() >
        200 * 86_400_000
      : false;

  // Trial progress
  let trialDaysLeft = 0;
  let trialProgress = 0;
  if (isTrialing && subscription.trial_ends_at) {
    const trialEnd = new Date(subscription.trial_ends_at);
    const trialStart = subscription.current_period_start
      ? new Date(subscription.current_period_start)
      : new Date(trialEnd.getTime() - 14 * 86_400_000);
    const totalDays = (trialEnd.getTime() - trialStart.getTime()) / 86_400_000;
    trialDaysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / 86_400_000));
    trialProgress = Math.min(100, ((totalDays - trialDaysLeft) / totalDays) * 100);
  }

  const nextPaymentDate = subscription.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    trialing:  { label: tSub('trialing'),  cls: 'text-amber-400 bg-amber-400/10 border-amber-400/20',   icon: <Clock className="h-3 w-3" /> },
    active:    { label: tSub('active'),    cls: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: <CheckCircle2 className="h-3 w-3" /> },
    cancelled: { label: tSub('cancelled'), cls: 'text-red-400 bg-red-400/10 border-red-400/20',         icon: <AlertCircle className="h-3 w-3" /> },
    expired:   { label: tSub('expired'),   cls: 'text-red-400 bg-red-400/10 border-red-400/20',         icon: <AlertCircle className="h-3 w-3" /> },
    paused:    { label: tSub('paused'),    cls: 'text-muted-foreground bg-muted/10 border-muted/20',     icon: <AlertCircle className="h-3 w-3" /> },
  };

  const statusCfg = STATUS_CONFIG[subscription.status] ?? STATUS_CONFIG.paused;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('subscription')}
              </p>
            </div>
            <p className="text-base font-bold">
              {isYearly ? t('yearlyPlan') : t('monthlyPlan')}
            </p>
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border shrink-0',
              statusCfg.cls,
            )}
          >
            {statusCfg.icon}
            {statusCfg.label}
          </span>
        </div>

        {/* Trial progress bar */}
        {isTrialing && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t('trialPeriod')}</span>
              <span className="text-amber-400 font-medium">
                {tSub('trialDaysLeft', { days: trialDaysLeft })}
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${trialProgress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Next payment */}
        {nextPaymentDate && isActive && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{t('nextPayment')}: {nextPaymentDate}</span>
          </div>
        )}

        {/* Upgrade teaser: monthly → yearly */}
        {isActive && !isYearly && (
          <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/5 p-3.5">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <p className="text-xs font-bold text-amber-400">{t('upgradeTitle')}</p>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">{t('upgradeSavings')}</p>
            <button className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs font-semibold text-amber-400 hover:bg-amber-500/30 transition-all">
              {t('upgradeToYearly')}
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Manage button */}
        <a
          href="/api/billing/portal"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          {t('manageSubscription')}
          <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

// ─── Keyboard Shortcuts Widget ─────────────────────────────────────────────────

function KeyboardShortcutsWidget() {
  const t = useTranslations('settings');
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/mac/i.test(navigator.userAgent) && !/iphone|ipad/i.test(navigator.userAgent));
  }, []);

  const mod = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { keys: ['Space'],      label: t('shortcutPomodoroToggle'), pomodoroOnly: true },
    { keys: ['R'],          label: t('shortcutPomodoroReset'),  pomodoroOnly: true },
    { keys: [mod, 'D'],     label: t('shortcutToggleTheme'),    pomodoroOnly: false },
    { keys: ['1 – 5'],      label: t('shortcutNavPages'),       pomodoroOnly: false },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('shortcuts')}
        </p>

        <div className="space-y-2.5">
          {shortcuts.map(({ keys, label, pomodoroOnly }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm text-muted-foreground truncate">{label}</span>
                {pomodoroOnly && (
                  <span className="text-[9px] text-muted-foreground/50 bg-white/5 border border-white/[0.07] px-1.5 py-0.5 rounded-full shrink-0">
                    Pomodoro
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {keys.map((key, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 font-mono text-[11px] font-semibold bg-white/5 border border-white/[0.12] rounded-md text-muted-foreground shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]">
                      {key}
                    </kbd>
                    {i < keys.length - 1 && (
                      <span className="text-[10px] text-muted-foreground/40">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/50 border-t border-white/[0.06] pt-3 leading-relaxed">
          {t('shortcutsNote')}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tSub = useTranslations('subscription');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dailyGoal, setDailyGoal] = useState(120);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: prof }, { data: sub }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('subscriptions').select('*').eq('user_id', user.id).single(),
    ]);

    if (prof) {
      setProfile(prof);
      setFullName(prof.full_name || '');
      setUsername(prof.username || '');
      setDailyGoal(prof.daily_goal_minutes);
    }
    if (sub) setSubscription(sub);
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: fullName,
      username: username,
      daily_goal_minutes: dailyGoal,
      preferred_locale: locale,
    }).eq('id', profile.id);
    setSaving(false);
    toast({ title: t('savedSuccessfully') });
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t('deleteWarning'))) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  const statusLabel: Record<string, string> = {
    trialing:  tSub('trialing'),
    active:    tSub('active'),
    cancelled: tSub('cancelled'),
    expired:   tSub('expired'),
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

      {/* ── Left: settings forms ── */}
      <div className="space-y-3">

        {/* Profile */}
        <Card className="border-border/50">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">{t('profile')}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('fullName')}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('username')}</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-9" />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('dailyGoal')}</Label>
                <Input
                  type="number"
                  min={30}
                  max={480}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-28 h-9"
                />
              </div>
              <Button size="sm" onClick={saveProfile} disabled={saving} className="h-9">
                {t('saveChanges')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme + Language — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">{t('theme')}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-col gap-1.5">
                {[
                  { value: 'light',  label: t('lightMode'),  icon: Sun },
                  { value: 'dark',   label: t('darkMode'),   icon: Moon },
                  { value: 'system', label: t('systemMode'), icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left',
                      theme === value
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">{t('language')}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <Select
                value={locale}
                onValueChange={(newLocale) => {
                  const newPath = window.location.pathname.replace(`/${locale}`, `/${newLocale}`);
                  router.push(newPath);
                }}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                  <SelectItem value="en">🇬🇧 English</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Subscription (mobile only) */}
        <Card className="border-border/50 xl:hidden">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">{t('subscription')}</CardTitle>
            {subscription && (
              <CardDescription className="text-xs">
                {statusLabel[subscription.status] || subscription.status}
                {subscription.trial_ends_at && subscription.status === 'trialing' && (
                  <span className="ml-2 text-amber-500">
                    · {tSub('trialDaysLeft', {
                      days: Math.max(0, Math.ceil((new Date(subscription.trial_ends_at).getTime() - Date.now()) / 86_400_000))
                    })}
                  </span>
                )}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {subscription?.status === 'active' ? (
              <a href="/api/billing/portal">
                <Button variant="outline" size="sm">{t('manageSubscription')}</Button>
              </a>
            ) : (
              <Button size="sm" onClick={() => router.push(`/${locale}/subscribe`)}>
                {tSub('subscribeNow')}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">{t('deleteAccount')}</CardTitle>
            <CardDescription>{t('deleteWarning')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount} className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t('deleteAccount')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Right: sticky widgets (desktop only) ── */}
      <div className="hidden xl:flex flex-col gap-4 sticky top-6">
        <SubscriptionWidget subscription={subscription} locale={locale} />
        <KeyboardShortcutsWidget />
      </div>
    </div>
  );
}
