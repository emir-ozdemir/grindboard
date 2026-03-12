'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ─── Mini visual illustrations ────────────────────────────────────────────────

function PomodoroVisual({ locale }: { locale: string }) {
  const r = 46;
  const circ = 2 * Math.PI * r;
  const progress = 0.72;
  const tabs = locale === 'en' ? ['Work', 'Short', 'Long'] : ['Çalışma', 'Kısa', 'Uzun'];
  const label = locale === 'en' ? 'WORK' : 'ÇALIŞMA';
  return (
    <div className="relative h-40 flex items-center justify-center bg-violet-500/5 rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(262,83%,58%,0.08),transparent_70%)]" />
      <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
        <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(262 83% 58%)" strokeWidth="7"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold tabular-nums">18:32</span>
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">{label}</span>
      </div>
      <div className="absolute bottom-3 flex gap-1">
        {tabs.map((l, i) => (
          <span key={l} className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${i === 0 ? 'bg-violet-500 text-white' : 'bg-muted text-muted-foreground'}`}>
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function ScheduleVisual({ locale }: { locale: string }) {
  const days = locale === 'en'
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'];
  const blocks = [
    { day: 0, start: 1, len: 2, color: 'bg-blue-500' },
    { day: 2, start: 0, len: 3, color: 'bg-violet-500' },
    { day: 4, start: 2, len: 2, color: 'bg-emerald-500' },
    { day: 1, start: 3, len: 1, color: 'bg-amber-500' },
  ];
  const rows = 5;
  return (
    <div className="h-40 bg-blue-500/5 rounded-xl overflow-hidden p-3">
      <div className="grid grid-cols-7 gap-0.5 h-full">
        {days.map((d, di) => (
          <div key={di} className="flex flex-col gap-0.5">
            <div className="text-[8px] text-center text-muted-foreground mb-0.5 font-medium">{d}</div>
            {Array.from({ length: rows }).map((_, ri) => {
              const block = blocks.find((b) => b.day === di && ri >= b.start && ri < b.start + b.len);
              return <div key={ri} className={`flex-1 rounded-sm ${block ? `${block.color} opacity-80` : 'bg-muted/40'}`} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function TopicsVisual({ locale }: { locale: string }) {
  const topics = locale === 'en'
    ? [{ label: 'Derivatives', done: true }, { label: 'Integrals', done: true }, { label: 'Limits', active: true }, { label: 'Sequences', done: false }, { label: 'Series', done: false }]
    : [{ label: 'Türev', done: true }, { label: 'İntegral', done: true }, { label: 'Limit', active: true }, { label: 'Diziler', done: false }, { label: 'Seriler', done: false }];
  const activeLabel = locale === 'en' ? 'Active' : 'Devam';
  return (
    <div className="h-40 bg-emerald-500/5 rounded-xl overflow-hidden p-3 space-y-1.5">
      {topics.map((t) => (
        <div key={t.label} className="flex items-center gap-2">
          <div className={`w-3.5 h-3.5 rounded shrink-0 flex items-center justify-center ${t.done ? 'bg-emerald-500' : t.active ? 'border-2 border-blue-500' : 'border border-muted-foreground/30'}`}>
            {t.done && (
              <svg viewBox="0 0 10 10" className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1.5 5l2.5 2.5 5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className={`text-[10px] ${t.done ? 'line-through text-muted-foreground' : t.active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{t.label}</span>
          {t.active && <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 font-medium">{activeLabel}</span>}
        </div>
      ))}
    </div>
  );
}

function StatsVisual({ locale }: { locale: string }) {
  const bars = [55, 90, 45, 120, 75, 105, 145];
  const max = 145;
  const label = locale === 'en' ? 'This week · 735 min' : 'Bu hafta · 735 dakika';
  const days = locale === 'en'
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['P', 'S', 'Ç', 'P', 'C', 'Ct', 'P'];
  return (
    <div className="h-40 bg-amber-500/5 rounded-xl overflow-hidden p-3">
      <div className="text-[8px] text-muted-foreground mb-2 font-medium">{label}</div>
      <div className="flex items-end gap-1 h-20">
        {bars.map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
            <div className={`w-full rounded-t-sm ${i === 6 ? 'bg-amber-500' : 'bg-amber-500/30'}`} style={{ height: `${(v / max) * 100}%` }} />
            <span className="text-[7px] text-muted-foreground">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakVisual({ locale }: { locale: string }) {
  const label = locale === 'en' ? 'day streak' : 'günlük seri';
  const days = locale === 'en'
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']
    : ['P', 'S', 'Ç', 'P', 'C', 'Ct', 'P'];
  return (
    <div className="h-40 bg-red-500/5 rounded-xl overflow-hidden p-3 flex flex-col items-center justify-center gap-2">
      <div className="text-5xl font-black text-red-500 leading-none">12</div>
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="flex gap-1 mt-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={`w-5 h-5 rounded-md text-[8px] flex items-center justify-center font-bold ${i < 5 ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
            {days[i]}
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiplatformVisual({ locale }: { locale: string }) {
  const devices = locale === 'en'
    ? [{ icon: '📱', label: 'Phone', w: 'w-10', h: 'h-16' }, { icon: '💻', label: 'Laptop', w: 'w-20', h: 'h-14' }, { icon: '📟', label: 'Tablet', w: 'w-14', h: 'h-12' }]
    : [{ icon: '📱', label: 'Telefon', w: 'w-10', h: 'h-16' }, { icon: '💻', label: 'Laptop', w: 'w-20', h: 'h-14' }, { icon: '📟', label: 'Tablet', w: 'w-14', h: 'h-12' }];
  return (
    <div className="h-40 bg-cyan-500/5 rounded-xl overflow-hidden p-3 flex items-center justify-center gap-4">
      {devices.map((d) => (
        <div key={d.label} className="flex flex-col items-center gap-1">
          <div className={`${d.w} ${d.h} rounded-lg border-2 border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center`}>
            <span className="text-lg">{d.icon}</span>
          </div>
          <span className="text-[8px] text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Carousel data ─────────────────────────────────────────────────────────────

const CARDS = [
  { key: 'pomodoro',      Visual: PomodoroVisual,      accent: '#8b5cf6' },
  { key: 'schedule',      Visual: ScheduleVisual,      accent: '#3b82f6' },
  { key: 'topics',        Visual: TopicsVisual,        accent: '#10b981' },
  { key: 'stats',         Visual: StatsVisual,         accent: '#f59e0b' },
  { key: 'streak',        Visual: StreakVisual,         accent: '#ef4444' },
  { key: 'multiplatform', Visual: MultiplatformVisual, accent: '#06b6d4' },
] as const;

type CardKey = typeof CARDS[number]['key'];

function normalizePos(raw: number, total: number) {
  return raw > total / 2 ? raw - total : raw;
}

const CARD_VARIANTS = {
  center:   { x: 0,    scale: 1,    rotateY: 0,   opacity: 1,   zIndex: 5 },
  right:    { x: 260,  scale: 0.78, rotateY: -22, opacity: 0.5, zIndex: 3 },
  left:     { x: -260, scale: 0.78, rotateY: 22,  opacity: 0.5, zIndex: 3 },
  farRight: { x: 420,  scale: 0.65, rotateY: -30, opacity: 0,   zIndex: 1 },
  farLeft:  { x: -420, scale: 0.65, rotateY: 30,  opacity: 0,   zIndex: 1 },
};

// ─── Main Component ───────────────────────────────────────────────────────────

export function Features() {
  const t = useTranslations('landing.features');
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const hovered = useRef(false);
  const N = CARDS.length;

  const next = useCallback(() => setActive((a) => (a + 1) % N), [N]);
  const prev = useCallback(() => setActive((a) => (a - 1 + N) % N), [N]);

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovered.current) next();
    }, 4500);
    return () => clearInterval(interval);
  }, [next]);

  const activeCard = CARDS[active];

  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        {/* ── 3D Carousel (desktop) ── */}
        <div
          className="relative hidden md:block"
          onMouseEnter={() => { hovered.current = true; }}
          onMouseLeave={() => { hovered.current = false; }}
        >
          {/* Cards stage */}
          <div
            className="relative h-64 flex items-center justify-center"
            style={{ perspective: '1100px' }}
          >
            {CARDS.map((card, i) => {
              const rawPos = (i - active + N) % N;
              const norm = normalizePos(rawPos, N);
              const variantKey =
                norm === 0 ? 'center' :
                norm === 1 ? 'right' :
                norm === -1 ? 'left' :
                norm > 1 ? 'farRight' : 'farLeft';
              const variant = CARD_VARIANTS[variantKey];
              const { Visual } = card;

              return (
                <motion.div
                  key={card.key}
                  animate={variant}
                  transition={{ type: 'spring', damping: 24, stiffness: 170 }}
                  onClick={() => (variantKey === 'right' || variantKey === 'left') && setActive(i)}
                  className="absolute w-72"
                  style={{
                    transformStyle: 'preserve-3d',
                    cursor: variantKey !== 'center' ? 'pointer' : 'default',
                  }}
                >
                  <div
                    className="rounded-2xl border bg-card/90 backdrop-blur-sm p-5 transition-shadow"
                    style={{
                      borderColor: variantKey === 'center' ? `${card.accent}50` : 'hsl(var(--border) / 0.4)',
                      boxShadow: variantKey === 'center' ? `0 0 40px ${card.accent}20` : 'none',
                    }}
                  >
                    <Visual locale={locale} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Nav arrows */}
          <button
            onClick={prev}
            className="absolute left-0 top-32 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-all shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-0 top-32 -translate-y-1/2 h-10 w-10 rounded-full flex items-center justify-center bg-card border border-border/60 text-muted-foreground hover:text-foreground hover:bg-accent transition-all shadow-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Feature info (below carousel on desktop) */}
        <div className="hidden md:block mt-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25 }}
              className="space-y-2"
            >
              <h3
                className="text-xl font-semibold"
                style={{ color: activeCard.accent }}
              >
                {t(`${activeCard.key}.title`)}
              </h3>
              <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
                {t(`${activeCard.key}.description`)}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {CARDS.map((card, i) => (
              <button
                key={card.key}
                onClick={() => setActive(i)}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === active ? 24 : 8,
                  backgroundColor: i === active ? activeCard.accent : 'hsl(var(--muted-foreground) / 0.3)',
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Mobile grid ── */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {CARDS.map((card, i) => {
            const { Visual } = card;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                className="rounded-2xl border border-border/60 bg-card/80 p-5"
                style={{ borderColor: `${card.accent}30` }}
              >
                <Visual locale={locale} />
                <h3 className="text-base font-semibold mt-4 mb-1.5" style={{ color: card.accent }}>
                  {t(`${card.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`${card.key}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
