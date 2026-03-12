'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Check, Zap, Sparkles, ArrowRight,
} from 'lucide-react';

interface PricingProps {
  locale: string;
}

export function Pricing({ locale }: PricingProps) {
  const t = useTranslations('landing.pricing');
  const features = t.raw('features') as string[];

  return (
    <section id="pricing" className="relative py-28 px-4 overflow-hidden">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto relative">

        {/* ── Section header ── */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-5 tracking-wide"
          >
            <Sparkles className="w-3 h-3" />
            {t('badge')}
          </motion.div>
          <motion.h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-base max-w-md mx-auto"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* ── Cards ── */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto items-start">

          {/* ── Monthly ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.15 }}
            className="rounded-2xl border border-border/60 bg-card p-7 flex flex-col gap-5"
          >
            {/* Label row */}
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {t('monthlyLabel')}
              </p>
            </div>

            {/* Price */}
            <div>
              <div className="flex items-end gap-1">
                <span className="text-5xl font-extrabold tracking-tight">${t('price')}</span>
                <span className="text-muted-foreground text-sm mb-1.5">{t('period')}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1.5">{t('trial')}</p>
            </div>

            {/* Divider */}
            <div className="h-px bg-border/50" />

            {/* Features */}
            <ul className="space-y-2.5 flex-1">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm">
                  <span className="w-5 h-5 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-primary" />
                  </span>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Link
              href={`/${locale}/register`}
              className="mt-1 flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-border/60 bg-card text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              {t('monthlyCta')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* ── Yearly (Featured) ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="relative"
          >
            {/* Outer glow — dark mode only */}
            <div className="pointer-events-none absolute -inset-px rounded-2xl dark:bg-gradient-to-b dark:from-amber-500/55 dark:via-amber-500/25 dark:to-orange-500/15 blur-sm" />
            <div className="pointer-events-none absolute -inset-[2px] rounded-2xl dark:bg-gradient-to-b dark:from-amber-500/35 dark:via-primary/15 dark:to-transparent" />

            {/* Card */}
            <div className="relative rounded-2xl border border-amber-500/40 bg-card dark:shadow-2xl dark:shadow-amber-500/10 overflow-hidden">

              {/* Amber tint — dark mode only */}
              <div className="pointer-events-none absolute inset-0 dark:bg-gradient-to-b dark:from-amber-500/[0.06] dark:to-transparent rounded-2xl" />

              <div className="relative p-7 flex flex-col gap-5">

                {/* Badge row */}
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t('yearlyLabel')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      <Zap className="h-2.5 w-2.5" />
                      {t('yearlyBadge')}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                      {t('yearlySavings')}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                      ${t('yearlyPrice')}
                    </span>
                    <span className="text-muted-foreground text-sm mb-1.5">{t('yearlyPeriod')}</span>
                  </div>
                  <div className="flex items-center gap-2.5 mt-1.5">
                    <span className="text-xs text-muted-foreground/50 line-through">{t('originalYearly')}</span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">{t('yearlyPerMonth')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t('trial')}</p>
                </div>

                {/* Savings callout */}
                <div className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                    {t('yearlySavingsCallout')}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-px bg-amber-500/15" />

                {/* Features */}
                <ul className="space-y-2.5 flex-1">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2.5 text-sm">
                      <span className="w-5 h-5 rounded-md bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div>
                  <Link
                    href={`/${locale}/register`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl btn-gradient text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.99] transition-transform"
                  >
                    {t('yearlyCta')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-center text-xs text-muted-foreground mt-2.5">{t('ctaSub')}</p>
                </div>

              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
