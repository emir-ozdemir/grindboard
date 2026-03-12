'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star } from 'lucide-react';

interface HeroProps {
  locale: string;
}

export function Hero({ locale }: HeroProps) {
  const t = useTranslations('landing.hero');

  return (
    <section className="relative min-h-[95vh] flex items-center justify-center pt-16 pb-20 px-4 overflow-hidden">
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25]"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      {/* Radial spotlight glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,hsl(var(--primary)/0.12),transparent_75%)]" />
      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      <div className="max-w-5xl mx-auto relative z-10 text-center w-full">
        {/* Pulsing badge */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-primary/25 bg-background/80 backdrop-blur-sm text-primary text-xs font-medium shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            {t('badge')}
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="text-foreground">{t('title')}</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-primary/40 bg-clip-text text-transparent">
            {t('titleAccent')}
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t('subtitle')}
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Button
            variant="gradient"
            size="lg"
            asChild
            className="h-12 px-8 text-base rounded-xl shadow-lg shadow-primary/25"
          >
            <Link href={`/${locale}/register`}>
              {t('cta')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <a
            href="#how-it-works"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
          >
            {t('ctaSecondary')} &rarr;
          </a>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <div className="flex -space-x-2.5">
            {(['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'] as string[]).map(
              (color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-[11px] font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {['A', 'B', 'C', 'D', 'E'][i]}
                </div>
              )
            )}
          </div>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            <strong className="text-foreground font-semibold">1.200+</strong> {t('socialProof')}
          </span>
        </motion.div>

        {/* App mockup */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
        >
          <div className="relative mx-auto max-w-4xl rounded-2xl border border-border/70 bg-card shadow-2xl shadow-black/30 overflow-hidden">
            {/* Browser bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border/60 bg-muted/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                <div className="w-3 h-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex-1 mx-4 h-5 bg-muted/60 rounded-md flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
                <span className="text-[10px] text-muted-foreground">app.grindboard.co</span>
              </div>
            </div>

            <div className="flex h-72 md:h-80">
              {/* Sidebar */}
              <div className="w-44 border-r border-border/40 bg-muted/5 p-3 shrink-0">
                <div className="flex items-center gap-2 px-2 py-2 mb-4">
                  <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-white/80 rounded-sm" />
                  </div>
                  <span className="text-xs font-bold tracking-tight">GrindBoard</span>
                </div>
                {(locale === 'en'
                  ? [
                      { label: 'Dashboard', active: true },
                      { label: 'Pomodoro', active: false },
                      { label: 'Schedule', active: false },
                      { label: 'Topics', active: false },
                      { label: 'Statistics', active: false },
                    ]
                  : [
                      { label: 'Kontrol Paneli', active: true },
                      { label: 'Pomodoro', active: false },
                      { label: 'Ders Programı', active: false },
                      { label: 'Konu Takip', active: false },
                      { label: 'İstatistikler', active: false },
                    ]
                ).map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] mb-0.5 ${
                      item.active
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.active ? 'bg-primary-foreground/70' : 'bg-muted-foreground/40'
                      }`}
                    />
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 p-5 space-y-3 overflow-hidden bg-background/50">
                {/* Stat row */}
                <div className="grid grid-cols-4 gap-2.5">
                  {(locale === 'en'
                    ? [
                        { label: 'Today', value: '145 min', color: 'text-violet-500' },
                        { label: 'Pomodoro', value: '6', color: 'text-blue-500' },
                        { label: 'Streak', value: '12 days', color: 'text-amber-500' },
                        { label: 'Goal', value: '96%', color: 'text-emerald-500' },
                      ]
                    : [
                        { label: 'Bugün', value: '145 dk', color: 'text-violet-500' },
                        { label: 'Pomodoro', value: '6', color: 'text-blue-500' },
                        { label: 'Seri', value: '12 gün', color: 'text-amber-500' },
                        { label: 'Hedef', value: '%96', color: 'text-emerald-500' },
                      ]
                  ).map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-xl bg-card border border-border/50 p-3"
                    >
                      <div className="text-[10px] text-muted-foreground mb-1">{stat.label}</div>
                      <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="rounded-xl bg-card border border-border/50 p-3">
                  <div className="text-[10px] text-muted-foreground mb-2.5 font-medium">
                    {locale === 'en' ? 'Weekly Study' : 'Haftalık Çalışma'}
                  </div>
                  <div className="flex items-end gap-1.5 h-12">
                    {[55, 90, 40, 120, 80, 100, 145].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end items-center gap-1">
                        <div
                          className={`w-full rounded-t ${i === 6 ? 'bg-primary' : 'bg-primary/25'}`}
                          style={{ height: `${(h / 145) * 100}%` }}
                        />
                        <span className="text-[7px] text-muted-foreground">
                          {locale === 'en'
                            ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]
                            : ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'][i]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div className="rounded-xl bg-card border border-border/50 p-3">
                  <div className="text-[10px] text-muted-foreground mb-2.5 font-medium">
                    {locale === 'en' ? 'Topic Progress' : 'Konu İlerlemesi'}
                  </div>
                  <div className="space-y-2">
                    {(locale === 'en'
                      ? [
                          { subject: 'Math', p: 72, c: 'bg-violet-500' },
                          { subject: 'English', p: 58, c: 'bg-blue-500' },
                          { subject: 'Physics', p: 34, c: 'bg-amber-500' },
                        ]
                      : [
                          { subject: 'Matematik', p: 72, c: 'bg-violet-500' },
                          { subject: 'Türkçe', p: 58, c: 'bg-blue-500' },
                          { subject: 'Fizik', p: 34, c: 'bg-amber-500' },
                        ]
                    ).map((s) => (
                      <div key={s.subject} className="flex items-center gap-2">
                        <span className="text-[9px] w-14 shrink-0 text-muted-foreground">
                          {s.subject}
                        </span>
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${s.c} rounded-full`}
                            style={{ width: `${s.p}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-muted-foreground w-7 text-right">
                          %{s.p}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Glow under mockup */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-primary/15 blur-3xl rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
