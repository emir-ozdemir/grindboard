import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { SummaryCard } from '@/components/dashboard/SummaryCard';
import { WeeklyChart } from '@/components/dashboard/WeeklyChart';
import { TrialBanner } from '@/components/dashboard/TrialBanner';
import { Progress } from '@/components/ui/progress';
import { Timer, Flame, Clock, Target } from 'lucide-react';
import { startOfWeek, eachDayOfInterval, endOfWeek, format, startOfDay, endOfDay } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import type { Locale } from '@/i18n/config';
import type { StudySession, Profile, Subscription } from '@/types/database';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('dashboard');
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  const dateLocale = locale === 'tr' ? tr : enUS;
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  // Fetch today's study sessions
  const { data: todaySessionsRaw } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('started_at', startOfDay(today).toISOString())
    .lte('started_at', endOfDay(today).toISOString());
  const todaySessions = todaySessionsRaw as StudySession[] | null;

  // Fetch this week's sessions
  const { data: weekSessionsRaw } = await supabase
    .from('study_sessions')
    .select('*')
    .eq('user_id', user.id)
    .gte('started_at', weekStart.toISOString())
    .lte('started_at', weekEnd.toISOString());
  const weekSessions = weekSessionsRaw as StudySession[] | null;

  // Fetch profile for daily goal
  const { data: profileRaw } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  const profile = profileRaw as Profile | null;

  // Fetch subscription
  const { data: subscriptionRaw } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();
  const subscription = subscriptionRaw as Subscription | null;

  // Calculate stats
  const todayMinutes = todaySessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
  const todayPomodoros = todaySessions?.filter((s) => s.session_type === 'pomodoro').length || 0;
  const dailyGoal = profile?.daily_goal_minutes || 120;
  const goalProgress = Math.min(100, Math.round((todayMinutes / dailyGoal) * 100));

  // Calculate streak
  const { data: allSessionsRaw } = await supabase
    .from('study_sessions')
    .select('started_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });
  const allSessions = allSessionsRaw as Array<{ started_at: string }> | null;

  let streak = 0;
  if (allSessions && allSessions.length > 0) {
    const uniqueDays = new Set(allSessions.map((s) => format(new Date(s.started_at), 'yyyy-MM-dd')));
    const checkDate = new Date(today);
    while (uniqueDays.has(format(checkDate, 'yyyy-MM-dd'))) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  }

  // Build weekly chart data
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const weeklyData = weekDays.map((day) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    const dayMinutes = weekSessions
      ?.filter((s) => format(new Date(s.started_at), 'yyyy-MM-dd') === dayStr)
      .reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
    return {
      day: format(day, 'EEE', { locale: dateLocale }),
      minutes: dayMinutes,
    };
  });

  const todayHours = Math.floor(todayMinutes / 60);
  const todayMins = todayMinutes % 60;
  const studyDisplay = todayHours > 0
    ? `${todayHours} ${t('hours')} ${todayMins} ${t('minutes')}`
    : `${todayMinutes} ${t('minutes')}`;

  return (
    <div className="space-y-6">
      {/* Trial Banner */}
      <TrialBanner subscription={subscription} />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title={t('totalStudy')} value={studyDisplay} icon={Clock} color="violet" />
        <SummaryCard title={t('pomodorosCompleted')} value={todayPomodoros} icon={Timer} color="blue" />
        <SummaryCard title={t('streak')} value={`${streak} ${t('days')}`} icon={Flame} color="amber" />
        <SummaryCard title={t('dailyGoal')} value={`${goalProgress}%`} icon={Target} color="emerald" />
      </div>

      {/* Goal Progress + Weekly Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border/50 bg-card p-5">
          <p className="text-sm font-semibold mb-0.5">{t('goalProgress')}</p>
          <p className="text-xs text-muted-foreground mb-4">
            {todayMinutes}/{dailyGoal} {t('minutes')}
          </p>
          <Progress value={goalProgress} className="h-1.5 mb-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0</span>
            <span className="text-emerald-500 font-medium">{goalProgress}%</span>
            <span>{dailyGoal} {t('min')}</span>
          </div>
        </div>

        <div className="lg:col-span-2">
          <WeeklyChart data={weeklyData} />
        </div>
      </div>
    </div>
  );
}
