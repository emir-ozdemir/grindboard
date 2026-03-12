'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, ChevronDown, Check, GraduationCap, Clock, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExams, getCountdown, type Exam } from '@/lib/hooks/useExams';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const EXAM_COLORS = [
  '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6',
  '#10b981', '#ec4899', '#f97316', '#06b6d4',
  '#84cc16', '#6366f1',
];

// ─── Countdown hook ───────────────────────────────────────────────────────────

function useCountdown(date: string) {
  const [cd, setCd] = useState(() => getCountdown(date));
  useEffect(() => {
    setCd(getCountdown(date));
    const id = setInterval(() => setCd(getCountdown(date)), 60000);
    return () => clearInterval(id);
  }, [date]);
  return cd;
}

// ─── Exam Card ────────────────────────────────────────────────────────────────

function ExamCard({ exam, onEdit, onDelete }: { exam: Exam; onEdit: () => void; onDelete: () => void }) {
  const t = useTranslations('exams');
  const cd = useCountdown(exam.date);
  const isUrgent = cd !== null && cd.days < 7;
  const isToday = cd !== null && cd.days === 0;

  const created = new Date(exam.createdAt).getTime();
  const examTime = new Date(exam.date).getTime();
  const now = Date.now();
  const progress = examTime > created
    ? Math.min(100, Math.max(0, ((now - created) / (examTime - created)) * 100))
    : 100;

  const dateStr = new Date(exam.date).toLocaleDateString('tr-TR', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const timeStr = new Date(exam.date).toLocaleTimeString('tr-TR', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <motion.div
      layout
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-2xl border bg-card overflow-hidden transition-all duration-300 hover:shadow-xl"
      style={{
        borderColor: isUrgent ? `${exam.color}50` : 'hsl(var(--border) / 0.4)',
        boxShadow: isUrgent ? `0 0 30px ${exam.color}18` : undefined,
        background: `linear-gradient(135deg, ${exam.color}0d 0%, transparent 55%)`,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full"
        style={{ backgroundColor: exam.color }}
      />

      <div className="pl-5 pr-4 pt-4 pb-4">
        {/* Header: name + urgency + actions */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ backgroundColor: exam.color }} />
            <span className="text-sm font-semibold text-foreground truncate">{exam.name}</span>
            {isUrgent && cd && cd.total > 0 && (
              <span
                className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                style={{ color: exam.color, backgroundColor: `${exam.color}18` }}
              >
                {isToday ? t('today') : cd.days < 3 ? t('veryClose') : t('thisWeek')}
              </span>
            )}
          </div>
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={onEdit}
              className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={onDelete}
              className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* ── Countdown hero ── */}
        {cd ? (
          <div className="mb-4">
            {isToday ? (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <span className="text-5xl font-black" style={{ color: exam.color }}>{t('todayBang')}</span>
              </motion.div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-6xl font-black tabular-nums leading-none"
                    style={{ color: exam.color }}
                  >
                    {cd.days > 0 ? cd.days : cd.hours}
                  </span>
                  <span className="text-base font-medium text-muted-foreground">
                    {cd.days > 0 ? t('days') : t('hours')}
                  </span>
                </div>
                {cd.days < 30 && (
                  <p className="text-xs text-muted-foreground mt-1 tabular-nums">
                    {cd.days > 0
                      ? t('hoursLeft', { h: cd.hours, m: cd.minutes })
                      : t('minsLeft', { m: cd.minutes })}
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <span className="text-2xl font-black text-muted-foreground/40">{t('completed')}</span>
          </div>
        )}

        {/* ── Progress bar ── */}
        <div className="space-y-1.5">
          <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: exam.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            <span>{dateStr}, {timeStr}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Archived card ────────────────────────────────────────────────────────────

function ArchivedCard({ exam, onDelete }: { exam: Exam; onDelete: () => void }) {
  const t = useTranslations('exams');
  const dateStr = new Date(exam.date).toLocaleDateString(undefined, {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/25 bg-muted/10 px-4 py-3 transition-all hover:bg-muted/20">
      <Trophy className="h-4 w-4 text-muted-foreground/40 shrink-0" />
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className="w-1.5 h-1.5 rounded-full shrink-0 opacity-50" style={{ backgroundColor: exam.color }} />
        <span className="text-sm font-medium text-foreground/60 truncate">{exam.name}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-xs text-muted-foreground/50">{dateStr}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground/60 font-medium">
          {t('completed')}
        </span>
        <button
          onClick={onDelete}
          className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────

function ExamModal({
  open, onClose, exam, onSave,
}: {
  open: boolean;
  onClose: () => void;
  exam: Exam | null;
  onSave: (data: Pick<Exam, 'name' | 'date' | 'color'>) => void;
}) {
  const t = useTranslations('exams');
  const [name, setName] = useState('');
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('09:00');
  const [color, setColor] = useState(EXAM_COLORS[0]);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (exam) {
        setName(exam.name);
        const [d, t] = exam.date.includes('T') ? exam.date.split('T') : [exam.date, '09:00'];
        setDatePart(d ?? '');
        setTimePart((t ?? '09:00').slice(0, 5));
        setColor(exam.color);
      } else {
        setName('');
        setDatePart('');
        setTimePart('09:00');
        setColor(EXAM_COLORS[0]);
      }
      setTimeout(() => nameRef.current?.focus(), 80);
    }
  }, [exam, open]);

  const combined = datePart ? `${datePart}T${timePart}` : '';
  const canSave = name.trim().length > 0 && datePart.length > 0;

  const previewDays = datePart
    ? Math.max(0, Math.floor((new Date(combined).getTime() - Date.now()) / 86400000))
    : null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {exam ? t('editExam') : t('newExam')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('examName')}</label>
            <input
              ref={nameRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('examNamePlaceholder')}
              className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>

          {/* Date + Time — split to avoid browser year-field UX bug */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t('dateTime')}</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={datePart}
                onChange={(e) => setDatePart(e.target.value)}
                className="flex-1 bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
              <input
                type="time"
                value={timePart}
                onChange={(e) => setTimePart(e.target.value)}
                className="w-28 bg-muted/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('color')}</label>
            <div className="flex gap-2 flex-wrap">
              {EXAM_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 focus:outline-none',
                    color === c && 'ring-2 ring-offset-2 ring-offset-background scale-110',
                  )}
                  style={{ backgroundColor: c, ...(color === c ? { ringColor: c } : {}) }}
                >
                  {color === c && <Check className="h-3.5 w-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Live preview card */}
          <AnimatePresence>
            {name && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="rounded-xl border overflow-hidden"
                  style={{
                    borderColor: `${color}40`,
                    background: `linear-gradient(135deg, ${color}10 0%, transparent 60%)`,
                  }}
                >
                  <div className="h-[2px]" style={{ backgroundColor: color }} />
                  <div className="flex items-center justify-between px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-semibold truncate">{name}</span>
                    </div>
                    {previewDays !== null && (
                      <span className="text-lg font-black tabular-nums ml-3" style={{ color }}>
                        {previewDays > 0 ? t('daysShort', { n: previewDays }) : t('today')}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('cancel')}
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => canSave && onSave({ name: name.trim(), date: combined, color })}
              disabled={!canSave}
              className="px-5 py-2 rounded-xl btn-gradient text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {exam ? t('save') : t('add')}
            </motion.button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExamsPage() {
  const t = useTranslations('exams');
  const { exams, addExam, updateExam, deleteExam, archiveExam } = useExams();
  const [showModal, setShowModal] = useState(false);
  const [editExam, setEditExam] = useState<Exam | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Auto-archive past exams
  const checkArchive = useCallback(() => {
    const now = Date.now();
    exams.forEach((e) => {
      if (!e.archived && new Date(e.date).getTime() < now) archiveExam(e.id);
    });
  }, [exams, archiveExam]);

  useEffect(() => {
    checkArchive();
  }, [checkArchive]);

  const upcoming = exams
    .filter((e) => !e.archived)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const archived = exams
    .filter((e) => e.archived)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const openAdd = () => { setEditExam(null); setShowModal(true); };
  const openEdit = (exam: Exam) => { setEditExam(exam); setShowModal(true); };

  // ── Nearest exam (for header spotlight) ──
  const nearest = upcoming[0];
  const nearestCd = nearest ? getCountdown(nearest.date) : null;

  return (
    <div className="space-y-6">

      {/* ── Header strip ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {upcoming.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {t('tracking', { count: upcoming.length })}
            </span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gradient text-white text-sm font-medium shadow-lg shadow-primary/20"
        >
          <Plus className="h-4 w-4" />
          {t('addExam')}
        </motion.button>
      </div>

      {/* ── Nearest exam spotlight ── */}
      {nearest && nearestCd && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border overflow-hidden p-5"
          style={{
            borderColor: `${nearest.color}35`,
            background: `linear-gradient(135deg, ${nearest.color}12 0%, ${nearest.color}05 40%, transparent 70%)`,
          }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: nearest.color }}
          />

          <div className="relative flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                {t('nearestExam')}
              </p>
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="text-6xl font-black tabular-nums leading-none"
                  style={{ color: nearest.color }}
                >
                  {nearestCd.days > 0 ? nearestCd.days : nearestCd.hours}
                </span>
                <span className="text-xl font-medium text-muted-foreground">
                  {nearestCd.days > 0 ? t('days') : t('hours')}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: nearest.color }} />
                <span className="text-base font-bold text-foreground">{nearest.name}</span>
                {nearestCd.days < 30 && (
                  <span className="text-sm text-muted-foreground">
                    — {t('hoursLeft', { h: nearestCd.hours, m: nearestCd.minutes })}
                  </span>
                )}
              </div>
            </div>

            {/* Days ring indicator */}
            <div className="shrink-0 hidden sm:flex flex-col items-center gap-1">
              <div
                className="w-16 h-16 rounded-full border-4 flex items-center justify-center"
                style={{ borderColor: `${nearest.color}40`, backgroundColor: `${nearest.color}10` }}
              >
                <GraduationCap className="h-7 w-7" style={{ color: nearest.color }} />
              </div>
              {upcoming.length > 1 && (
                <span className="text-[10px] text-muted-foreground">{t('others', { count: upcoming.length - 1 })}</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Empty state ── */}
      {exams.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-28 gap-6 text-center"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute inset-0 rounded-3xl bg-primary/10"
            />
          </div>
          <div className="max-w-xs">
            <p className="text-lg font-bold text-foreground">{t('emptyTitle')}</p>
            <p className="text-sm text-muted-foreground mt-1.5">{t('emptyDesc')}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={openAdd}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-medium shadow-lg shadow-primary/25"
          >
            <Plus className="h-4 w-4" />
            {t('addFirst')}
          </motion.button>
        </motion.div>
      )}

      {/* ── Upcoming grid ── */}
      {upcoming.length > 0 && (
        <div>
          {upcoming.length > 1 && (
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {t('allExams')}
            </p>
          )}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {upcoming.map((exam, i) => (
                <motion.div
                  key={exam.id}
                  layout
                  initial={{ opacity: 0, y: 16, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                  transition={{ delay: i * 0.04, duration: 0.22 }}
                >
                  <ExamCard
                    exam={exam}
                    onEdit={() => openEdit(exam)}
                    onDelete={() => deleteExam(exam.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* ── Archived section ── */}
      {archived.length > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-200', showArchived && 'rotate-180')} />
            {t('pastExams', { count: archived.length })}
          </button>
          <AnimatePresence>
            {showArchived && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                {archived.map((exam) => (
                  <ArchivedCard key={exam.id} exam={exam} onDelete={() => deleteExam(exam.id)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── Modal ── */}
      <ExamModal
        open={showModal}
        onClose={() => setShowModal(false)}
        exam={editExam}
        onSave={(data) => {
          if (editExam) updateExam(editExam.id, data);
          else addExam(data);
          setShowModal(false);
        }}
      />
    </div>
  );
}
