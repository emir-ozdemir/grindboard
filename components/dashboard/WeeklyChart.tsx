'use client';

import { useTranslations } from 'next-intl';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeeklyData {
  day: string;
  minutes: number;
}

interface WeeklyChartProps {
  data: WeeklyData[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, minLabel }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-2 shadow-lg text-xs">
      <p className="font-medium text-foreground mb-0.5">{label}</p>
      <p className="text-muted-foreground">{payload[0].value} {minLabel}</p>
    </div>
  );
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const t = useTranslations('dashboard');
  const total = data.reduce((s, d) => s + d.minutes, 0);

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-sm font-semibold">{t('weeklyChart')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{total} {t('min')} {t('total')}</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -28, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip minLabel={t('min')} />} cursor={{ fill: 'hsl(var(--muted))', radius: 6 }} />
          <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
