import { createClient } from '@/lib/supabase/server';
import { StatsCharts } from '@/components/stats/StatsCharts';
import type { Locale } from '@/i18n/config';

export default async function StatsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: sessions } = await supabase
    .from('study_sessions')
    .select('*, subject:subjects(name, color)')
    .eq('user_id', user.id)
    .gte('started_at', thirtyDaysAgo.toISOString())
    .order('started_at', { ascending: false });

  const { data: topics } = await supabase
    .from('topics')
    .select('status')
    .eq('user_id', user.id);

  const totalTopics = topics?.length || 0;
  const completedTopics = topics?.filter((t: { status: string }) => t.status === 'completed').length || 0;
  const topicCompletionRate = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Calculate streak
  const allSessions = await supabase
    .from('study_sessions')
    .select('started_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  let currentStreak = 0;
  let longestStreak = 0;

  if (allSessions.data && allSessions.data.length > 0) {
    const format = (d: Date) => d.toISOString().slice(0, 10);
    const uniqueDays: string[] = Array.from(new Set(allSessions.data.map((s: { started_at: string }) => format(new Date(s.started_at)))));

    const checkDate = new Date();

    while (uniqueDays.includes(format(checkDate))) {
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

  return (
    <div className="space-y-6">
      <StatsCharts
        sessions={sessions || []}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        topicCompletionRate={topicCompletionRate}
        locale={locale}
      />
    </div>
  );
}
