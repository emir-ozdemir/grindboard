import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { StatsCharts } from '@/components/stats/StatsCharts';
import type { Locale } from '@/i18n/config';

export const metadata: Metadata = {
  title: 'Statistics',
  alternates: { canonical: '/stats' },
};

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // 90-day sessions with subjects (for charts + subject leaderboard)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('*, subject:subjects(name, color)')
    .eq('user_id', user.id)
    .gte('started_at', ninetyDaysAgo.toISOString())
    .order('started_at', { ascending: true });

  // Topics for completion rate
  const { data: topics } = await supabase
    .from('topics')
    .select('status')
    .eq('user_id', user.id);

  const totalTopics = topics?.length || 0;
  const completedTopics = topics?.filter((t: { status: string }) => t.status === 'completed').length || 0;
  const topicCompletionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // All sessions for streak + heatmap + productivity analysis
  const { data: allSessionsData } = await supabase
    .from('study_sessions')
    .select('started_at, duration_minutes')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  // Streak calculation
  let currentStreak = 0;
  let longestStreak = 0;

  if (allSessionsData && allSessionsData.length > 0) {
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const uniqueDays: string[] = Array.from(
      new Set(allSessionsData.map((s: { started_at: string }) => fmt(new Date(s.started_at))))
    );

    const checkDate = new Date();
    while (uniqueDays.includes(fmt(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    let tempStreak = 1;
    for (let i = 1; i < uniqueDays.length; i++) {
      const prev = new Date(uniqueDays[i - 1] as string);
      const curr = new Date(uniqueDays[i] as string);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  // Build heatmap data: date string → total minutes
  const heatmapData: Record<string, number> = {};
  allSessionsData?.forEach((s: { started_at: string; duration_minutes: number }) => {
    const dateStr = s.started_at.slice(0, 10);
    heatmapData[dateStr] = (heatmapData[dateStr] || 0) + s.duration_minutes;
  });

  // Most productive day of week (0 = Sun … 6 = Sat)
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  allSessionsData?.forEach((s: { started_at: string; duration_minutes: number }) => {
    dayTotals[new Date(s.started_at).getDay()] += s.duration_minutes;
  });
  const mostProductiveDayIndex = dayTotals.some((d) => d > 0)
    ? dayTotals.indexOf(Math.max(...dayTotals))
    : -1;

  // Most productive hour (0–23)
  const hourTotals = Array<number>(24).fill(0);
  allSessionsData?.forEach((s: { started_at: string; duration_minutes: number }) => {
    hourTotals[new Date(s.started_at).getHours()] += s.duration_minutes;
  });
  const mostProductiveHour = hourTotals.some((h) => h > 0)
    ? hourTotals.indexOf(Math.max(...hourTotals))
    : -1;

  const totalSessionCount = allSessionsData?.length || 0;

  return (
    <div className="space-y-6">
      <StatsCharts
        sessions={sessions || []}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        topicCompletionRate={topicCompletionRate}
        heatmapData={heatmapData}
        mostProductiveDayIndex={mostProductiveDayIndex}
        mostProductiveHour={mostProductiveHour}
        totalSessionCount={totalSessionCount}
        locale={locale}
      />
    </div>
  );
}
