import { createClient } from '@/lib/supabase/server';
import { GoalsPage } from '@/components/goals/GoalsPage';
import type { Subject } from '@/types/database';

export default async function GoalsServerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const subjects: Subject[] = user
    ? (await supabase.from('subjects').select('*').eq('user_id', user.id).order('name')).data ?? []
    : [];

  return <GoalsPage subjects={subjects} />;
}
