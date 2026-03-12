'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Check,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Timer,
  Calendar,
  BookMarked,
  BarChart3,
  GraduationCap,
  NotebookPen,
  RefreshCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Subscription } from '@/types/database';

const FEATURES = [
  { icon: Timer,         key: 'pomodoro' },
  { icon: Calendar,     key: 'schedule' },
  { icon: BookMarked,   key: 'topics' },
  { icon: BarChart3,    key: 'stats' },
  { icon: GraduationCap, key: 'exams' },
  { icon: NotebookPen,  key: 'notes' },
  { icon: RefreshCcw,   key: 'sync' },
] as const;

interface SubscribePricingProps {
  subscription: Subscription | null;
  isTrialing: boolean;
}

function PricingCard({
  period,
  onCheckout,
  loading,
  isTrialing,
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
      {/* Outer glow — dark mode only */}
      {isYearly && (
        <div className="pointer-events-none absolute -inset-px rounded-2xl dark:bg-gradient-to-b dark:from-amber-500/50 dark:via-amber-500/20 dark:to-transparent" />
      )}

      {/* Card border + bg */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl bg-card',
          isYearly
            ? 'border border-amber-500/40 dark:bg-gradient-to-b dark:from-amber-500/[0.07] dark:to-transparent'
            : 'border border-border/50',
        )}
      />

      {/* Top badge row */}
      <div className="relative px-6 pt-5 pb-0 flex items-center justify-between min-h-[36px]">
        {isYearly ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full">
            <Zap className="w-3 h-3" />
            {t('mostPopular')}
          </span>
        ) : (
          <span />
        )}
        {isYearly && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            {t('yearlySavingsBadge')}
          </span>
        )}
      </div>

      <div className="relative flex flex-col flex-1 p-6 pt-4">
        {/* Plan label */}
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          {isYearly ? t('yearly') : t('monthly')}
        </p>

        {/* Price */}
        <div className="mb-1">
          <div className="flex items-end gap-1">
            <span className={cn(
              'font-extrabold tracking-tight leading-none',
              isYearly ? 'text-4xl md:text-5xl' : 'text-4xl',
            )}>
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

        {/* Yearly savings callout */}
        {isYearly && (
          <div className="mt-4 mb-1 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">{t('yearlySavingsTitle')}</p>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-border/40 my-5" />

        {/* Features */}
        <ul className="space-y-3 flex-1">
          {FEATURES.map(({ icon: Icon, key }) => (
            <li key={key} className="flex items-center gap-2.5 text-sm">
              <span className={cn(
                'w-5 h-5 rounded-md flex items-center justify-center shrink-0',
                isYearly
                  ? 'bg-amber-500/10 border border-amber-500/25'
                  : 'bg-primary/10 border border-primary/20',
              )}>
                <Icon className={cn('w-3 h-3', isYearly ? 'text-amber-600 dark:text-amber-400' : 'text-primary')} />
              </span>
              <span className="text-foreground/80 leading-snug">{t(`features.${key}` as never)}</span>
              <Check className={cn(
                'w-3.5 h-3.5 ml-auto shrink-0',
                isYearly ? 'text-amber-600 dark:text-amber-400' : 'text-primary',
              )} />
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={() => onCheckout(period)}
          disabled={!!loading}
          className={cn(
            'mt-6 w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            isYearly
              ? 'btn-gradient text-white shadow-lg hover:scale-[1.02] active:scale-[0.99]'
              : 'border border-border/60 bg-card text-foreground hover:bg-muted/50 dark:hover:bg-white/5 hover:border-border',
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

export function SubscribePricing({ subscription, isTrialing }: SubscribePricingProps) {
  const t = useTranslations('subscribe');
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);

  const isActive = subscription?.status === 'active';

  const handleCheckout = async (period: 'monthly' | 'yearly') => {
    setLoading(period);
    window.location.href = `/api/billing/checkout?period=${period}`;
  };

  /* ── Already subscribed ── */
  if (isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6"
        >
          <Check className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2">{t('alreadyActive')}</h2>
        <a
          href="/api/billing/portal"
          className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {t('manageSubscription')}
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    );
  }

  return (
    <div className="relative max-w-3xl mx-auto px-4 py-6">

      {/* Ambient bg glow */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-amber-500/8 rounded-full blur-3xl" />

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

      {/* Two cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <PricingCard period="monthly" onCheckout={handleCheckout} loading={loading} isTrialing={isTrialing} />
        <PricingCard period="yearly"  onCheckout={handleCheckout} loading={loading} isTrialing={isTrialing} />
      </div>

      {/* Trust badge */}
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
