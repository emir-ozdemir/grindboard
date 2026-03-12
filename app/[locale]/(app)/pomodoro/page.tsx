import { createClient } from '@/lib/supabase/server';
import { PomodoroTimer } from '@/components/pomodoro/PomodoroTimer';

export default async function PomodoroPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: subjects } = await supabase
    .from('subjects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  return <PomodoroTimer userId={user.id} subjects={subjects || []} />;
}
