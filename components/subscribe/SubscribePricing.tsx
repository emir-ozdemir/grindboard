'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Check, Lock, ArrowRight, Sparkles, Zap,
  Timer, Calendar, BookMarked, BarChart3,
  GraduationCap, NotebookPen, RefreshCcw,
  Crown, AlertTriangle, PauseCircle,
  Target, Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/types/database';

const FEATURES = [
  { icon: Timer,          key: 'pomodoro' },
  { icon: Calendar,       key: 'schedule' },
  { icon: BookMarked,     key: 'topics' },
  { icon: BarChart3,      key: 'stats' },
  { icon: GraduationCap,  key: 'exams' },
  { icon: NotebookPen,    key: 'notes' },
  { icon: Target,         key: 'goals' },
  { icon: Flame,          key: 'streak' },
  { icon: RefreshCcw,     key: 'sync' },
] as const;

interface SubscribePricingProps {
  subscription: Subscription | null;
  isTrialing: boolean;
  locale: string;
}

// ── Pricing Card ──────────────────────────────────────────────────────────────

function PricingCard({
  period, onCheckout, loading, isTrialing,
}: {
  period: 'monthly' | 'yearly';
  onCheckout: (period: 'monthly' | 'yearly') => void;
  loading: 'monthly' | 'yearly' | null;
  isTrialing: boolean;
}) {
  const t = useTranslations('subscribe');
  const isYearly = period === 'yearly';
  const isLoading = loading === period;

  return (
    <motion.div
      initial={{ y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, delay: isYearly ? 0.1 : 0.18 }}
      className={cn(
        'relative flex flex-col rounded-2xl overflow-hidden',
        isYearly ? 'order-first md:order-last' : '',
      )}
    >
      {isYearly && (
        <div className="pointer-events-none absolute -inset-px rounded-2xl dark:bg-gradient-to-b dark:from-amber-500/50 dark:via-amber-500/20 dark:to-transparent" />
      )}
      <div className={cn(
        'absolute inset-0 rounded-2xl bg-card',
        isYearly
          ? 'border border-amber-500/40 dark:bg-gradient-to-b dark:from-amber-500/[0.07] dark:to-transparent'
          : 'border border-border/50',
      )} />

      <div className="relative px-6 pt-5 pb-0 flex items-center justify-between min-h-[36px]">
        {isYearly ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            {t('mostPopular')}
          </span>
        ) : <span />}
        {isYearly && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {t('yearlySavingsBadge')}
          </span>
        )}
      </div>

      <div className="relative flex flex-col flex-1 p-6 pt-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          {isYearly ? t('yearly') : t('monthly')}
        </p>

        <div className="mb-1">
          <div className="flex items-end gap-1">
            <span className={cn('font-extrabold tracking-tight leading-none', isYearly ? 'text-4xl md:text-5xl' : 'text-4xl')}>
              {isYearly ? t('yearlyMonthlyPrice') : t('monthlyPrice')}
            </span>
            <span className="text-muted-foreground text-sm mb-1">{t('perMonth')}</span>
          </div>
          {isYearly ? (
            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
              <span className="text-muted-foreground/40 line-through">{t('monthlyPrice')}{t('perMonth')}</span>
              <span>·</span>
              <span>{t('yearlyTotal')}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1.5">{t('monthlyBilledDesc')}</p>
          )}
        </div>

        {isYearly && (
          <div className="mt-4 mb-1 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{t('yearlySavingsTitle')}</p>
          </div>
        )}

        <div className="h-px bg-border/40 my-5" />

        <ul className="space-y-3 flex-1">
          {FEATURES.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-2.5 text-sm">
              <span className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center shrink-0',
                isYearly ? 'bg-amber-500/10 border border-amber-500/25' : 'bg-primary/10 border border-primary/20',
              )}>
                <Icon className={cn('w-3 h-3', isYearly ? 'text-amber-600 dark:text-amber-400' : 'text-primary')} />
              </span>
              <span className="text-foreground/80 leading-snug">{t(`features.${key}` as never)}</span>
              <Check className={cn('w-3.5 h-3.5 ml-auto shrink-0', isYearly ? 'text-amber-600 dark:text-amber-400' : 'text-primary')} />
            </li>
          ))}
        </ul>

        <button
          onClick={() => onCheckout(period)}
          disabled={!!loading}
          className={cn(
            'mt-6 w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            isYearly
              ? 'btn-gradient text-white shadow-lg hover:scale-[1.02] active:scale-[0.99]'
              : 'border border-border/60 bg-card text-foreground hover:bg-muted/50 dark:hover:bg-white/5',
          )}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              {t('loading')}
            </>
          ) : (
            <>
              {isTrialing ? t('cta') : t('ctaTrial')}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ── Active Subscription Panel ─────────────────────────────────────────────────

function ActivePanel({ subscription, locale }: { subscription: Subscription; locale: string }) {
  const t = useTranslations('subscribe');
  const isGifted = subscription.status === 'gifted';

  const fmt = (dateStr: string | null) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
      : '—';

  const rows = isGifted
    ? [
        { label: t('planLabel'), value: subscription.plan_name || 'GrindBoard Pro' },
        { label: t('memberSinceLabel'), value: fmt(subscription.created_at) },
      ]
    : [
        { label: t('planLabel'), value: subscription.plan_name || '—' },
        { label: t('periodLabel'), value: subscription.current_period_start ? fmt(subscription.current_period_start) : '—' },
        { label: t('nextPaymentLabel'), value: fmt(subscription.current_period_end) },
        { label: t('memberSinceLabel'), value: fmt(subscription.created_at) },
      ];

  return (
    <div className="max-w-lg mx-auto py-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`rounded-2xl border bg-card overflow-hidden ${isGifted ? 'border-violet-500/30' : 'border-emerald-500/30'}`}
      >
        {/* Top bar */}
        <div className={`h-1 bg-gradient-to-r ${isGifted ? 'from-violet-400 via-purple-500 to-fuchsia-500' : 'from-emerald-400 via-emerald-500 to-teal-500'}`} />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isGifted ? 'bg-violet-500/15 border border-violet-500/25' : 'bg-emerald-500/15 border border-emerald-500/25'}`}>
                <Crown className={`w-5 h-5 ${isGifted ? 'text-violet-500' : 'text-emerald-500'}`} />
              </div>
              <div>
                <h2 className="font-bold text-base text-foreground">GrindBoard Pro</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isGifted ? 'bg-violet-500' : 'bg-emerald-500'}`} />
                  <span className={`text-xs font-semibold ${isGifted ? 'text-violet-500' : 'text-emerald-500'}`}>
                    {isGifted ? (locale === 'tr' ? 'Hediye Üyelik' : 'Gifted Access') : t('statusActive')}
                  </span>
                </div>
              </div>
            </div>
            {!isGifted && (
              <a
                href="/api/billing/portal"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl btn-gradient text-white text-sm font-semibold shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                {t('manageSubscription')}
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* Details */}
          <div className="rounded-xl border border-border/40 overflow-hidden">
            {rows.map((row, i) => (
              <div
                key={row.label}
                className={cn(
                  'flex items-center justify-between px-4 py-3 text-sm',
                  i < rows.length - 1 ? 'border-b border-border/30' : '',
                  i % 2 === 0 ? 'bg-muted/20' : '',
                )}
              >
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* All features included reminder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-4 rounded-2xl border border-border/40 bg-card p-5"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          {t('planName')}
        </p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FEATURES.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-2 text-sm text-foreground/70">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-3 h-3 text-emerald-500" />
              </span>
              {t(`features.${key}` as never)}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}

// ── Notice Banner (for cancelled / expired / paused) ─────────────────────────

function NoticeBanner({ type }: { type: 'cancelled' | 'expired' | 'paused' }) {
  const t = useTranslations('subscribe');

  const config = {
    cancelled: {
      icon: <AlertTriangle className="w-4 h-4" />,
      message: t('cancelledNotice'),
      color: 'text-orange-500',
      bg: 'bg-orange-500/10 border-orange-500/25',
    },
    expired: {
      icon: <AlertTriangle className="w-4 h-4" />,
      message: t('expiredNotice'),
      color: 'text-red-500',
      bg: 'bg-red-500/10 border-red-500/25',
    },
    paused: {
      icon: <PauseCircle className="w-4 h-4" />,
      message: t('pausedNotice'),
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 border-blue-500/25',
    },
  }[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 mb-6 text-sm', config.bg, config.color)}
    >
      <span className="shrink-0 mt-0.5">{config.icon}</span>
      <span className="font-medium">{config.message}</span>
      {type === 'paused' && (
        <a href="/api/billing/portal" className="ml-auto shrink-0 underline underline-offset-2 text-xs font-semibold">
          {t('manageSubscription')}
        </a>
      )}
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SubscribePricing({ subscription, isTrialing, locale }: SubscribePricingProps) {
  const t = useTranslations('subscribe');
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);

  const status = subscription?.status;

  const handleCheckout = async (period: 'monthly' | 'yearly') => {
    setLoading(period);
    window.location.href = `/api/billing/checkout?period=${period}`;
  };

  // Active or gifted subscriber → full management panel
  if (status === 'active' || status === 'gifted') {
    return <ActivePanel subscription={subscription!} locale={locale} />;
  }

  // Everything else → pricing page (with optional notice banner)
  return (
    <div className="relative max-w-3xl mx-auto px-4 py-6">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-amber-500/8 rounded-full blur-3xl" />

      {/* Notice banners for special states */}
      {status === 'cancelled' && <NoticeBanner type="cancelled" />}
      {status === 'expired' && <NoticeBanner type="expired" />}
      {status === 'paused' && <NoticeBanner type="paused" />}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-bold mb-4 tracking-wide">
          <Sparkles className="w-3 h-3" />
          GrindBoard Pro
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">{t('title')}</h1>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">{t('subtitle')}</p>
      </motion.div>

      {/* Pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <PricingCard period="monthly" onCheckout={handleCheckout} loading={loading} isTrialing={isTrialing} />
        <PricingCard period="yearly"  onCheckout={handleCheckout} loading={loading} isTrialing={isTrialing} />
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="flex items-center justify-center gap-1.5 mt-6 text-xs text-muted-foreground/40"
      >
        <Lock className="w-3 h-3" />
        {t('secure')}
      </motion.div>
    </div>
  );
}
