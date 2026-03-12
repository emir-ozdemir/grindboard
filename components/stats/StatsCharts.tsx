'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, startOfWeek, eachDayOfInterval, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Flame, Trophy, BookCheck } from 'lucide-react';

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
  locale: string;
}

type Period = 'daily' | 'weekly' | 'monthly';

export function StatsCharts({ sessions, currentStreak, longestStreak, topicCompletionRate }: StatsChartsProps) {
  const t = useTranslations('stats');
  const [period, setPeriod] = useState<Period>('weekly');

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);

  // Build chart data based on period
  const chartData = (() => {
    if (period === 'daily') {
      // Last 7 days by hour (today)
      const hours = Array.from({ length: 24 }, (_, i) => i);
      return hours.map((h) => {
        const dayStr = format(today, 'yyyy-MM-dd');
        const mins = sessions
          .filter((s) => {
            const d = new Date(s.started_at);
            return format(d, 'yyyy-MM-dd') === dayStr && d.getHours() === h;
          })
          .reduce((sum, s) => sum + s.duration_minutes, 0);
        return { label: `${h}:00`, minutes: mins };
      }).filter((d) => d.minutes > 0);
    }

    if (period === 'weekly') {
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      return days.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const mins = sessions
          .filter((s) => format(new Date(s.started_at), 'yyyy-MM-dd') === dayStr)
          .reduce((sum, s) => sum + s.duration_minutes, 0);
        return { label: format(day, 'EEE'), minutes: mins };
      });
    }

    // monthly - last 30 days by day
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    return days.map((day) => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const mins = sessions
        .filter((s) => format(new Date(s.started_at), 'yyyy-MM-dd') === dayStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);
      return { label: format(day, 'd'), minutes: mins };
    });
  })();

  // Subject distribution for pie chart
  const subjectMap = new Map<string, { name: string; color: string; minutes: number }>();
  sessions.forEach((s) => {
    if (!s.subject) return;
    const key = s.subject.name;
    if (subjectMap.has(key)) {
      subjectMap.get(key)!.minutes += s.duration_minutes;
    } else {
      subjectMap.set(key, { name: s.subject.name, color: s.subject.color, minutes: s.duration_minutes });
    }
  });
  const pieData = Array.from(subjectMap.values());

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <div className="space-y-6">
      {/* Period Tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)}>
        <TabsList>
          <TabsTrigger value="daily">{t('daily')}</TabsTrigger>
          <TabsTrigger value="weekly">{t('weekly')}</TabsTrigger>
          <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{totalHours}h {totalMinutes % 60}m</div>
            <p className="text-xs text-muted-foreground mt-1">{t('totalStudyTime')}</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 flex items-start gap-2">
            <div>
              <div className="text-2xl font-bold flex items-center gap-1">
                {currentStreak} <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('currentStreak')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 flex items-start gap-2">
            <div>
              <div className="text-2xl font-bold flex items-center gap-1">
                {longestStreak} <Trophy className="h-5 w-5 text-yellow-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('longestStreak')}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4 flex items-start gap-2">
            <div>
              <div className="text-2xl font-bold flex items-center gap-1">
                {topicCompletionRate}% <BookCheck className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t('topicCompletion')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium">{t('totalStudyTime')}</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.some((d) => d.minutes > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v} dk`]}
                />
                <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              {t('noData')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subject Distribution */}
      {pieData.length > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-medium">{t('subjectDistribution')}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="minutes" nameKey="name" cx="50%" cy="50%" outerRadius={80} // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={({ name, percent }: any) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${v} dk`]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
