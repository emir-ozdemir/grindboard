'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  format, startOfWeek, eachDayOfInterval, endOfWeek,
  startOfMonth, endOfMonth,
} from 'date-fns';
import {
  Flame, Trophy, BookCheck, Target, Clock,
  Zap, CalendarDays, BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Session {
  started_at: string;
  duration_minutes: number;
  subject?: { name: string; color: string } | null;
}

interface StatsChartsProps {
  sessions: Session[];
  currentStreak: number;
  longestStreak: number;
  topicCompletionRate: number;
  heatmapData: Record<string, number>;
  mostProductiveDayIndex: number;
  mostProductiveHour: number;
  totalSessionCount: number;
  locale: string;
}

type Period = 'daily' | 'weekly' | 'monthly';

// ── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon, value, label, accent, sub,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  accent: string;
  sub?: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border/40 bg-card overflow-hidden p-5">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}70, transparent)` }}
      />
      <div
        className="absolute bottom-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-10 pointer-events-none"
        style={{ backgroundColor: accent }}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground font-medium mb-2 truncate">{label}</p>
          <p className="text-2xl font-black tracking-tight leading-none" style={{ color: accent }}>
            {value}
          </p>
          {sub && <p className="text-xs text-muted-foreground/70 mt-1.5">{sub}</p>}
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ── Activity Heatmap ─────────────────────────────────────────────────────────

function ActivityHeatmap({
  heatmapData, locale,
}: {
  heatmapData: Record<string, number>;
  locale: string;
}) {
  const t = useTranslations('stats');
  const WEEKS = 15;
  const TOTAL_DAYS = WEEKS * 7;
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const cells = useMemo(() => {
    return Array.from({ length: TOTAL_DAYS }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (TOTAL_DAYS - 1 - i));
      const dateStr = d.toISOString().slice(0, 10);
      return {
        dateStr,
        minutes: heatmapData[dateStr] || 0,
        month: d.getMonth(),
        dayOfWeek: d.getDay(),
        isToday: dateStr === todayStr,
        label: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heatmapData, locale]);

  const weeks = useMemo(() => {
    const result = [];
    for (let w = 0; w < WEEKS; w++) result.push(cells.slice(w * 7, (w + 1) * 7));
    return result;
  }, [cells]);

  const monthLabels = useMemo(() => {
    return weeks.map((week, wi) => {
      const first = week[0]!;
      const prev = wi > 0 ? weeks[wi - 1]![0]! : null;
      const changed = !prev || first.month !== prev.month;
      return changed
        ? new Date(first.dateStr).toLocaleDateString(locale, { month: 'short' })
        : null;
    });
  }, [weeks, locale]);

  const getColor = (minutes: number): string | undefined => {
    if (minutes === 0) return undefined;
    if (minutes < 30) return '#f59e0b22';
    if (minutes < 60) return '#f59e0b55';
    if (minutes < 120) return '#f59e0b99';
    return '#f59e0b';
  };

  // Short day labels for Y axis (Mon, Wed, Fri rows)
  const dayRowLabels = locale === 'tr'
    ? ['', 'Pzt', '', 'Çar', '', 'Cum', '']
    : ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5">
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-primary" />
          {t('activityCalendar')}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span>{t('less')}</span>
          <div className="w-3 h-3 rounded-sm bg-muted/50" />
          {['#f59e0b22', '#f59e0b55', '#f59e0b99', '#f59e0b'].map((c) => (
            <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span>{t('more')}</span>
        </div>
      </div>

      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {/* Day label column */}
        <div className="flex flex-col gap-0.5 mr-1 shrink-0">
          <div className="h-4" />
          {dayRowLabels.map((label, i) => (
            <div key={i} className="h-3 flex items-center">
              <span className="text-[9px] text-muted-foreground/50 leading-none w-6">{label}</span>
            </div>
          ))}
        </div>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 shrink-0">
            <div className="h-4 flex items-end pb-0.5">
              {monthLabels[wi] && (
                <span className="text-[9px] text-muted-foreground/60 leading-none whitespace-nowrap">
                  {monthLabels[wi]}
                </span>
              )}
            </div>
            {week.map((cell, di) => (
              <div
                key={di}
                title={`${cell.label}: ${cell.minutes} dk`}
                className={cn(
                  'w-3 h-3 rounded-sm transition-all cursor-default',
                  cell.minutes === 0 ? 'bg-muted/40' : '',
                  cell.isToday ? 'ring-1 ring-primary/70 ring-offset-0' : '',
                )}
                style={cell.minutes > 0 ? { backgroundColor: getColor(cell.minutes) } : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Subject Leaderboard ───────────────────────────────────────────────────────

function SubjectLeaderboard({ sessions }: { sessions: Session[] }) {
  const t = useTranslations('stats');

  const subjects = useMemo(() => {
    const map = new Map<string, { name: string; color: string; minutes: number; count: number }>();
    sessions.forEach((s) => {
      if (!s.subject) return;
      const key = s.subject.name;
      const ex = map.get(key);
      if (ex) { ex.minutes += s.duration_minutes; ex.count++; }
      else map.set(key, { name: s.subject.name, color: s.subject.color, minutes: s.duration_minutes, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.minutes - a.minutes);
  }, [sessions]);

  const maxMin = subjects[0]?.minutes || 1;

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 h-full">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        <BarChart3 className="w-4 h-4 text-primary" />
        {t('subjectLeaderboard')}
      </h3>

      {subjects.length === 0 ? (
        <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
          {t('noData')}
        </div>
      ) : (
        <div className="space-y-3.5">
          {subjects.slice(0, 7).map((subj, i) => {
            const h = Math.floor(subj.minutes / 60);
            const m = subj.minutes % 60;
            const timeStr = h > 0 ? `${h}s ${m}dk` : `${m}dk`;
            const pct = (subj.minutes / maxMin) * 100;
            return (
              <motion.div
                key={subj.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-[10px] text-muted-foreground/50 font-mono w-3.5 shrink-0">
                      {i + 1}
                    </span>
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span className="text-xs font-medium truncate">{subj.name}</span>
                  </div>
                  <span
                    className="text-xs font-bold tabular-nums shrink-0"
                    style={{ color: subj.color }}
                  >
                    {timeStr}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: subj.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, delay: i * 0.04, ease: 'easeOut' }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Productivity Insights ─────────────────────────────────────────────────────

function ProductivityInsights({
  mostProductiveDayIndex,
  mostProductiveHour,
  totalSessionCount,
  sessions,
  locale,
}: {
  mostProductiveDayIndex: number;
  mostProductiveHour: number;
  totalSessionCount: number;
  sessions: Session[];
  locale: string;
}) {
  const t = useTranslations('stats');

  const dayName = mostProductiveDayIndex >= 0
    ? new Date(2023, 0, 1 + mostProductiveDayIndex).toLocaleDateString(locale, { weekday: 'long' })
    : '—';

  const hourStr = mostProductiveHour >= 0
    ? `${String(mostProductiveHour).padStart(2, '0')}:00`
    : '—';

  const totalMins = sessions.reduce((s, x) => s + x.duration_minutes, 0);
  const avgMins = sessions.length > 0 ? Math.round(totalMins / sessions.length) : 0;
  const avgStr = avgMins >= 60
    ? `${Math.floor(avgMins / 60)}s ${avgMins % 60}dk`
    : `${avgMins}dk`;

  const items = [
    { icon: <CalendarDays className="w-4 h-4" />, label: t('mostProductiveDay'), value: dayName, color: '#8b5cf6' },
    { icon: <Clock className="w-4 h-4" />, label: t('mostProductiveHour'), value: hourStr, color: '#3b82f6' },
    { icon: <Target className="w-4 h-4" />, label: t('sessionCount'), value: String(totalSessionCount), color: '#10b981' },
    { icon: <Zap className="w-4 h-4" />, label: t('avgPerSession'), value: avgStr, color: '#f59e0b' },
  ];

  return (
    <div className="rounded-2xl border border-border/40 bg-card p-5 h-full">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-primary" />
        {t('productivity')}
      </h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${item.color}18`, color: item.color }}
              >
                {item.icon}
              </div>
              <span className="text-xs text-muted-foreground truncate">{item.label}</span>
            </div>
            <span className="text-sm font-bold shrink-0" style={{ color: item.color }}>
              {item.value}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const mins = payload[0]?.value ?? 0;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl text-xs">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-bold text-foreground">
        {h > 0 ? `${h}s ${m}dk` : `${m}dk`}
      </p>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function StatsCharts({
  sessions,
  currentStreak,
  longestStreak,
  topicCompletionRate,
  heatmapData,
  mostProductiveDayIndex,
  mostProductiveHour,
  totalSessionCount,
  locale,
}: StatsChartsProps) {
  const t = useTranslations('stats');
  const [period, setPeriod] = useState<Period>('weekly');

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  const totalMinutes = sessions.reduce((s, x) => s + x.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMinsRem = totalMinutes % 60;

  const chartData = useMemo(() => {
    if (period === 'daily') {
      const dayStr = format(today, 'yyyy-MM-dd');
      return Array.from({ length: 24 }, (_, h) => {
        const mins = sessions
          .filter((s) => {
            const d = new Date(s.started_at);
            return format(d, 'yyyy-MM-dd') === dayStr && d.getHours() === h;
          })
          .reduce((sum, s) => sum + s.duration_minutes, 0);
        return { label: `${h}:00`, minutes: mins };
      });
    }
    if (period === 'weekly') {
      return eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const mins = sessions
          .filter((s) => format(new Date(s.started_at), 'yyyy-MM-dd') === dayStr)
          .reduce((sum, s) => sum + s.duration_minutes, 0);
        return { label: format(day, 'EEE'), minutes: mins };
      });
    }
    return eachDayOfInterval({ start: monthStart, end: monthEnd }).map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const mins = sessions
        .filter((s) => format(new Date(s.started_at), 'yyyy-MM-dd') === dayStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);
      return { label: format(day, 'd'), minutes: mins };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, sessions]);

  const statCards = [
    {
      icon: <Clock className="w-4 h-4" />,
      value: totalMinutes > 0 ? `${totalHours}s ${totalMinsRem}dk` : '0dk',
      label: t('totalStudyTime'),
      accent: '#f59e0b',
      sub: t('last90days'),
    },
    {
      icon: <Flame className="w-4 h-4" />,
      value: String(currentStreak),
      label: t('currentStreak'),
      accent: '#f97316',
      sub: t('days'),
    },
    {
      icon: <Trophy className="w-4 h-4" />,
      value: String(longestStreak),
      label: t('longestStreak'),
      accent: '#eab308',
      sub: t('days'),
    },
    {
      icon: <BookCheck className="w-4 h-4" />,
      value: `${topicCompletionRate}%`,
      label: t('topicCompletion'),
      accent: '#10b981',
      sub: t('completedLabel'),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.3 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      {/* Activity Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28 }}
      >
        <ActivityHeatmap heatmapData={heatmapData} locale={locale} />
      </motion.div>

      {/* Study Time Area Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.34 }}
        className="rounded-2xl border border-border/40 bg-card p-5"
      >
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="text-sm font-semibold text-foreground">{t('studyTimeChart')}</h3>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
            <TabsList className="h-7">
              <TabsTrigger value="daily" className="text-xs h-6 px-2.5">{t('daily')}</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs h-6 px-2.5">{t('weekly')}</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs h-6 px-2.5">{t('monthly')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={period}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {chartData.some((d) => d.minutes > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    strokeOpacity={0.4}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    dataKey="minutes"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#amberGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                {t('noData')}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Subject Leaderboard + Productivity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <SubjectLeaderboard sessions={sessions} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.46 }}
        >
          <ProductivityInsights
            mostProductiveDayIndex={mostProductiveDayIndex}
            mostProductiveHour={mostProductiveHour}
            totalSessionCount={totalSessionCount}
            sessions={sessions}
            locale={locale}
          />
        </motion.div>
      </div>
    </div>
  );
}
