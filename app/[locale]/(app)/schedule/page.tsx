'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { WeeklyGrid } from '@/components/schedule/WeeklyGrid';
import { AddBlockModal } from '@/components/schedule/AddBlockModal';
import { Plus, CalendarDays } from 'lucide-react';
import type { Schedule, Subject } from '@/types/database';

type ScheduleWithSubject = Schedule & { subject: Subject };

const DAY_KEY_MAP = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

export default function SchedulePage() {
  const t = useTranslations('schedule');
  const locale = useLocale();
  const [schedules, setSchedules] = useState<ScheduleWithSubject[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const today = new Date().getDay();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: subs }, { data: scheds }] = await Promise.all([
      supabase.from('subjects').select('*').eq('user_id', user.id),
      supabase
        .from('schedules')
        .select('*, subject:subjects(*)')
        .eq('user_id', user.id)
        .order('start_time'),
    ]);

    setSubjects(subs || []);
    setSchedules((scheds as ScheduleWithSubject[]) || []);
    setLoading(false);
  };

  const handleAdd = async (data: {
    subject_id: string;
    day_of_week: number;
    start_time: string;
    end_time: string;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('schedules').insert({ ...data, user_id: user.id });
    await fetchData();
  };

  const handleDelete = async (id: string) => {
    await supabase.from('schedules').delete().eq('id', id);
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const now = new Date();
  const weekLabel = `${t('weekPrefix')}${now.toLocaleDateString(locale, { day: 'numeric', month: 'long' })}${t('weekSuffix')}`;
  const todayName = t(`days.${DAY_KEY_MAP[today]}` as any);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted-foreground"
        >
          {weekLabel} · {todayName}{t('daySuffix')}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          onClick={() => setShowModal(true)}
          className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:opacity-90 active:scale-95 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          {t('addBlock')}
        </motion.button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-500/30 border-t-amber-500 animate-spin" />
        </div>
      ) : schedules.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24 gap-5"
        >
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <CalendarDays className="h-9 w-9 text-amber-400/70" />
          </div>
          <div className="text-center space-y-1.5">
            <h3 className="text-lg font-semibold">{t('emptyTitle')}</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              {t('emptyDesc')}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-gradient flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:opacity-90 transition-all"
          >
            <Plus className="h-4 w-4" />
            {t('addFirst')}
          </button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WeeklyGrid schedules={schedules} onDelete={handleDelete} today={today} />
        </motion.div>
      )}

      <AddBlockModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
        subjects={subjects}
      />
    </div>
  );
}
