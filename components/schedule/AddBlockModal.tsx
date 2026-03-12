'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Check, Clock } from 'lucide-react';
import type { Subject } from '@/types/database';

interface AddBlockModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { subject_id: string; day_of_week: number; start_time: string; end_time: string }) => Promise<void>;
  subjects: Subject[];
}

const ORDERED_DAYS = [1, 2, 3, 4, 5, 6, 0];

export function AddBlockModal({ open, onClose, onAdd, subjects }: AddBlockModalProps) {
  const t = useTranslations('schedule');
  const tc = useTranslations('common');
  const DAY_LABELS: Record<number, string> = {
    0: t('daysShort.sun' as any), 1: t('daysShort.mon' as any), 2: t('daysShort.tue' as any),
    3: t('daysShort.wed' as any), 4: t('daysShort.thu' as any), 5: t('daysShort.fri' as any),
    6: t('daysShort.sat' as any),
  };
  const [subjectId, setSubjectId] = useState('');
  const [day, setDay] = useState(1);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [loading, setLoading] = useState(false);

  const selectedSubject = subjects.find((s) => s.id === subjectId);

  const handleAdd = async () => {
    if (!subjectId) return;
    setLoading(true);
    await onAdd({
      subject_id: subjectId,
      day_of_week: day,
      start_time: startTime + ':00',
      end_time: endTime + ':00',
    });
    setLoading(false);
    onClose();
    setSubjectId('');
    setDay(1);
    setStartTime('09:00');
    setEndTime('10:00');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-white/[0.08] bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
        {/* Accent glow top */}
        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

        <div className="p-6 space-y-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t('addBlock')}</DialogTitle>
            <p className="text-sm text-muted-foreground">{t('addBlockDesc')}</p>
          </DialogHeader>

          {/* Subject picker */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('selectSubject')}
            </p>
            <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto pr-1">
              {subjects.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2 text-center">
                  {t('noSubjects')}
                </p>
              ) : (
                subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubjectId(s.id)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left',
                      subjectId === s.id
                        ? 'border-white/20 bg-white/8'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/5',
                    )}
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0 ring-2 ring-offset-2 ring-offset-background transition-all"
                      style={{
                        backgroundColor: s.color,
                        ringColor: subjectId === s.id ? s.color : 'transparent',
                      }}
                    />
                    <span className="text-sm font-medium flex-1">{s.name}</span>
                    <AnimatePresence>
                      {subjectId === s.id && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: s.color }}
                        >
                          <Check className="h-3 w-3 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Day picker */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('selectDay')}
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {ORDERED_DAYS.map((dayIdx) => (
                <button
                  key={dayIdx}
                  onClick={() => setDay(dayIdx)}
                  className={cn(
                    'py-2 rounded-xl text-xs font-semibold border transition-all',
                    day === dayIdx
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                      : 'bg-white/[0.03] border-white/[0.07] text-muted-foreground hover:text-foreground hover:bg-white/6',
                  )}
                >
                  {DAY_LABELS[dayIdx]}
                </button>
              ))}
            </div>
          </div>

          {/* Time pickers */}
          <div className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> {t('timeRange')}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t('startTime'), value: startTime, onChange: setStartTime },
                { label: t('endTime'), value: endTime, onChange: setEndTime },
              ].map(({ label, value, onChange }) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs text-muted-foreground">{label}</label>
                  <input
                    type="time"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-amber-500/40 transition-colors tabular-nums"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedSubject && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl border"
              style={{
                backgroundColor: selectedSubject.color + '12',
                borderColor: selectedSubject.color + '40',
              }}
            >
              <div
                className="w-2 h-10 rounded-full shrink-0"
                style={{ backgroundColor: selectedSubject.color }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: selectedSubject.color }}>
                  {selectedSubject.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {DAY_LABELS[day]} · {startTime}–{endTime}
                </p>
              </div>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            >
              {tc('cancel')}
            </button>
            <button
              onClick={handleAdd}
              disabled={!subjectId || loading}
              className={cn(
                'flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all',
                subjectId && !loading
                  ? 'btn-gradient hover:opacity-90 active:scale-[0.98]'
                  : 'bg-white/10 text-muted-foreground cursor-not-allowed',
              )}
            >
              {loading ? t('adding') : t('addBlock')}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
