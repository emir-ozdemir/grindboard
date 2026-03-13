'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Target, CheckCircle2, Circle, Trash2, Edit3,
  ChevronDown, ChevronUp, Flag, Calendar,
  Flame, TrendingUp, ListChecks, X, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoals } from '@/lib/hooks/useGoals';
import type { Goal } from '@/types/database';
import type { Subject } from '@/types/database';

// ── Canvas confetti (lazy) ────────────────────────────────────────────────────

async function fireConfetti() {
  const confetti = (await import('canvas-confetti')).default;
  confetti({ particleCount: 100, spread: 80, origin: { y: 0.55 }, colors: ['#f59e0b', '#fbbf24', '#d97706', '#10b981', '#34d399'] });
}

// ── Priority config ────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  low:    { color: 'text-blue-500',   bg: 'bg-blue-500/10 border-blue-500/25',   bar: 'bg-blue-500',   left: 'bg-blue-500/60' },
  medium: { color: 'text-amber-500',  bg: 'bg-amber-500/10 border-amber-500/25', bar: 'bg-amber-500',  left: 'bg-amber-500/70' },
  high:   { color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/25',     bar: 'bg-red-500',    left: 'bg-red-500/70' },
};

// ── Goal Form ─────────────────────────────────────────────────────────────────

interface GoalFormData {
  title: string;
  category: Goal['category'];
  priority: Goal['priority'];
  progress_type: Goal['progress_type'];
  progress_target: number;
  subject_id: string;
  target_date: string;
  note: string;
}

const DEFAULT_FORM: GoalFormData = {
  title: '',
  category: 'daily',
  priority: 'medium',
  progress_type: 'checkbox',
  progress_target: 1,
  subject_id: '',
  target_date: '',
  note: '',
};

function GoalModal({
  open, goal, subjects, onClose, onSave,
}: {
  open: boolean;
  goal: Goal | null;
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: GoalFormData) => Promise<void>;
}) {
  const t = useTranslations('goals');
  const tc = useTranslations('common');
  const [form, setForm] = useState<GoalFormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(goal ? {
        title: goal.title,
        category: goal.category,
        priority: goal.priority,
        progress_type: goal.progress_type,
        progress_target: goal.progress_target,
        subject_id: goal.subject_id ?? '',
        target_date: goal.target_date ?? '',
        note: goal.note ?? '',
      } : DEFAULT_FORM);
    }
  }, [open, goal]);

  const set = (field: keyof GoalFormData, value: string | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 50, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-primary to-amber-600" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <h2 className="font-bold text-lg">{goal ? t('editGoal') : t('addGoal')}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
              {t('goalTitle')}
            </label>
            <input
              autoFocus
              value={form.title}
              onChange={e => set('title', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder={t('goalTitlePlaceholder')}
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-base outline-none focus:border-primary/60 focus:bg-muted/50 transition-colors"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                {t('category')}
              </label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/60 transition-colors"
              >
                <option value="daily">{t('daily')}</option>
                <option value="weekly">{t('weekly')}</option>
                <option value="general">{t('general')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                {t('priority')}
              </label>
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/60 transition-colors"
              >
                <option value="low">{t('priorityLow')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="high">{t('priorityHigh')}</option>
              </select>
            </div>
          </div>

          {/* Progress type */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
              {t('progressType')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['checkbox', 'numeric'] as const).map(pt => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => set('progress_type', pt)}
                  className={cn(
                    'px-4 py-3 rounded-xl text-sm font-semibold border transition-all',
                    form.progress_type === pt
                      ? 'bg-primary/10 border-primary/50 text-primary shadow-sm'
                      : 'bg-muted/20 border-border/40 text-muted-foreground hover:bg-muted/40'
                  )}
                >
                  {t(pt)}
                </button>
              ))}
            </div>
          </div>

          {/* Numeric target */}
          {form.progress_type === 'numeric' && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                {t('progressTarget')}
              </label>
              <input
                type="number"
                min={1}
                value={form.progress_target}
                onChange={e => set('progress_target', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          )}

          {/* Subject */}
          {subjects.length > 0 && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                {t('selectSubject')}
              </label>
              <select
                value={form.subject_id}
                onChange={e => set('subject_id', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/60 transition-colors"
              >
                <option value="">{t('noSubject')}</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Target date (only for general) */}
          {form.category === 'general' && (
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                {t('targetDate')}
              </label>
              <input
                type="date"
                value={form.target_date}
                onChange={e => set('target_date', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
              {t('note')}
            </label>
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder={t('notePlaceholder')}
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/60 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border/40 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-border/50 text-sm font-semibold hover:bg-muted/30 transition-colors"
          >
            {tc('cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="flex-1 py-3 rounded-xl btn-gradient text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('saving')}</>
            ) : (
              <><Check className="w-4 h-4" />{goal ? tc('save') : t('addGoal')}</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Goal Item ──────────────────────────────────────────────────────────────────

function GoalItem({
  goal, subjects, onToggle, onSetProgress, onEdit, onDelete,
}: {
  goal: Goal;
  subjects: Subject[];
  onToggle: () => void;
  onSetProgress: (v: number) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const t = useTranslations('goals');
  const [expanded, setExpanded] = useState(false);
  const subject = subjects.find(s => s.id === goal.subject_id);
  const pCfg = PRIORITY_CONFIG[goal.priority];
  const pct = goal.progress_type === 'numeric'
    ? Math.min(100, Math.round((goal.progress_current / goal.progress_target) * 100))
    : goal.is_completed ? 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex rounded-2xl border overflow-hidden transition-all duration-200',
        goal.is_completed
          ? 'border-border/20 bg-muted/5'
          : 'border-border/40 bg-card hover:border-border/70 hover:shadow-md dark:hover:shadow-black/20'
      )}
    >
      {/* Priority left accent bar */}
      {!goal.is_completed && (
        <div className={cn('w-1 shrink-0', pCfg.left)} />
      )}

      <div className="flex items-start gap-4 p-5 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="shrink-0 mt-0.5 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          {goal.is_completed
            ? <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            : <Circle className={cn('w-6 h-6 transition-colors', pCfg.color, 'opacity-50 hover:opacity-100')} />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-base font-semibold leading-snug',
                goal.is_completed ? 'line-through text-muted-foreground/40' : 'text-foreground'
              )}>
                {goal.title}
              </p>

              {/* Meta row */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={cn(
                  'inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border',
                  pCfg.bg, pCfg.color
                )}>
                  <Flag className="w-2.5 h-2.5" />
                  {t(goal.priority)}
                </span>
                {subject && (
                  <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: subject.color }} />
                    {subject.name}
                  </span>
                )}
                {goal.target_date && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
                    <Calendar className="w-3 h-3" />
                    {goal.target_date}
                  </span>
                )}
              </div>
            </div>

            {/* Actions (always visible on mobile, hover on desktop) */}
            <div className="flex items-center gap-1 shrink-0 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              {goal.progress_type === 'numeric' && !goal.is_completed && (
                <div className="flex items-center gap-0.5 mr-1">
                  <button
                    onClick={() => onSetProgress(goal.progress_current - 1)}
                    className="w-7 h-7 rounded-lg hover:bg-muted/70 flex items-center justify-center text-base font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >−</button>
                  <button
                    onClick={() => onSetProgress(goal.progress_current + 1)}
                    className="w-7 h-7 rounded-lg hover:bg-muted/70 flex items-center justify-center text-base font-bold text-muted-foreground hover:text-foreground transition-colors"
                  >+</button>
                </div>
              )}
              <button onClick={onEdit} className="w-8 h-8 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors">
                <Edit3 className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={onDelete} className="w-8 h-8 rounded-xl hover:bg-red-500/10 flex items-center justify-center transition-colors">
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500 transition-colors" />
              </button>
            </div>
          </div>

          {/* Numeric progress bar */}
          {goal.progress_type === 'numeric' && (
            <div className="mt-3 space-y-1.5">
              <div className="h-2 bg-muted/40 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', pCfg.bar)}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground/60">{pct}%</span>
                <span className={cn('text-xs font-bold tabular-nums', pCfg.color)}>
                  {goal.progress_current}{t('of')}{goal.progress_target}
                </span>
              </div>
            </div>
          )}

          {/* Expandable note */}
          {goal.note && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              <span>{expanded ? goal.note : goal.note.slice(0, 60) + (goal.note.length > 60 ? '...' : '')}</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── Summary Cards ──────────────────────────────────────────────────────────────

function SummaryCards({ dailyGoals, weeklyGoals, generalGoals }: {
  dailyGoals: Goal[];
  weeklyGoals: Goal[];
  generalGoals: Goal[];
}) {
  const t = useTranslations('goals');
  const cards = [
    { icon: Flame,      label: t('todaySummary'),   goals: dailyGoals,   iconColor: 'text-amber-500', accent: 'from-amber-500/20 to-amber-500/5', border: 'border-amber-500/25', ring: 'ring-amber-500/30' },
    { icon: TrendingUp, label: t('weekSummary'),    goals: weeklyGoals,  iconColor: 'text-violet-500', accent: 'from-violet-500/20 to-violet-500/5', border: 'border-violet-500/25', ring: 'ring-violet-500/30' },
    { icon: ListChecks, label: t('generalSummary'), goals: generalGoals, iconColor: 'text-emerald-500', accent: 'from-emerald-500/20 to-emerald-500/5', border: 'border-emerald-500/25', ring: 'ring-emerald-500/30' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ icon: Icon, label, goals, iconColor, accent, border, ring }, idx) => {
        const done = goals.filter(g => g.is_completed).length;
        const total = goals.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const allDone = total > 0 && done === total;

        return (
          <motion.div
            key={label}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: idx * 0.06 }}
            className={cn(
              'relative rounded-2xl border overflow-hidden p-5',
              border,
              allDone ? 'ring-2 ' + ring : ''
            )}
            style={{ background: `linear-gradient(135deg, var(--card) 0%, transparent 100%)` }}
          >
            {/* Gradient overlay */}
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-40', accent)} />

            <div className="relative">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
                'bg-background/60 border',
                border
              )}>
                <Icon className={cn('w-5 h-5', iconColor)} />
              </div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
              <div className="flex items-end gap-1.5 mt-1">
                <span className={cn('text-3xl font-extrabold tabular-nums leading-none', iconColor)}>{done}</span>
                <span className="text-base text-muted-foreground font-semibold mb-0.5">/{total}</span>
              </div>

              {/* Mini progress bar */}
              {total > 0 && (
                <div className="mt-3 h-1.5 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', allDone ? 'bg-emerald-500' : iconColor.replace('text-', 'bg-'))}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 + idx * 0.1 }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Goal List ──────────────────────────────────────────────────────────────────

function GoalList({
  goals, subjects, onToggle, onSetProgress, onEdit, onDelete, emptyMessage,
}: {
  goals: Goal[];
  subjects: Subject[];
  onToggle: (g: Goal) => void;
  onSetProgress: (g: Goal, v: number) => void;
  onEdit: (g: Goal) => void;
  onDelete: (g: Goal) => void;
  emptyMessage: string;
}) {
  const t = useTranslations('goals');

  if (goals.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-20 flex flex-col items-center text-center gap-4"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-muted/30 border border-border/30 flex items-center justify-center">
            <Target className="w-10 h-10 text-muted-foreground/30" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 rounded-2xl bg-primary/5"
          />
        </div>
        <div>
          <p className="text-base font-semibold text-muted-foreground">{emptyMessage}</p>
          <p className="text-sm text-muted-foreground/50 mt-1">{t('noGoalsDesc')}</p>
        </div>
      </motion.div>
    );
  }

  const priorityOrder: Record<Goal['priority'], number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...goals].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {sorted.map(goal => (
          <GoalItem
            key={goal.id}
            goal={goal}
            subjects={subjects}
            onToggle={() => onToggle(goal)}
            onSetProgress={v => onSetProgress(goal, v)}
            onEdit={() => onEdit(goal)}
            onDelete={() => onDelete(goal)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

const TABS = ['daily', 'weekly', 'general'] as const;
type Tab = typeof TABS[number];

const TAB_ICONS = { daily: Flame, weekly: TrendingUp, general: ListChecks };

export function GoalsPage({ subjects }: { subjects: Subject[] }) {
  const t = useTranslations('goals');
  const {
    dailyGoals, weeklyGoals, generalGoals,
    loading, error,
    addGoal, updateGoal, toggleGoal, setNumericProgress, deleteGoal,
  } = useGoals();

  const [activeTab, setActiveTab] = useState<Tab>('daily');
  const [modalOpen, setModalOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [celebratingTab, setCelebratingTab] = useState<Tab | null>(null);
  const prevCompleted = useRef<Record<Tab, number>>({ daily: -1, weekly: -1, general: -1 });

  const tabGoals: Record<Tab, Goal[]> = {
    daily: dailyGoals,
    weekly: weeklyGoals,
    general: generalGoals,
  };

  useEffect(() => {
    for (const tab of TABS) {
      const goals = tabGoals[tab];
      if (goals.length === 0) continue;
      const done = goals.filter(g => g.is_completed).length;
      if (done === goals.length && prevCompleted.current[tab] !== -1 && prevCompleted.current[tab] !== goals.length) {
        setCelebratingTab(tab);
        fireConfetti();
        setTimeout(() => setCelebratingTab(null), 3500);
      }
      prevCompleted.current[tab] = done;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyGoals, weeklyGoals, generalGoals]);

  const openAdd = () => { setEditGoal(null); setModalOpen(true); };
  const openEdit = (g: Goal) => { setEditGoal(g); setModalOpen(true); };

  const handleSave = useCallback(async (data: GoalFormData) => {
    const payload = {
      ...data,
      subject_id: data.subject_id || null,
      target_date: data.target_date || null,
      note: data.note || null,
    };
    if (editGoal) {
      await updateGoal(editGoal.id, payload);
    } else {
      await addGoal(payload);
      setActiveTab(data.category as Tab);
    }
    setModalOpen(false);
  }, [editGoal, addGoal, updateGoal]);

  const handleDelete = useCallback(async (goal: Goal) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    await deleteGoal(goal.id);
  }, [deleteGoal, t]);

  const currentGoals = tabGoals[activeTab];

  return (
    <div className="max-w-3xl mx-auto space-y-7">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('dailyResetNote')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-3 rounded-xl btn-gradient text-white font-bold shadow-lg text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('addGoal')}
        </motion.button>
      </div>

      {/* ── Summary Cards ── */}
      <SummaryCards dailyGoals={dailyGoals} weeklyGoals={weeklyGoals} generalGoals={generalGoals} />

      {/* ── Tabs + List ── */}
      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm">
        {/* Tab bar */}
        <div className="flex border-b border-border/40 bg-muted/20">
          {TABS.map(tab => {
            const goals = tabGoals[tab];
            const done = goals.filter(g => g.is_completed).length;
            const isActive = activeTab === tab;
            const Icon = TAB_ICONS[tab];

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-4 text-sm font-semibold transition-all relative',
                  isActive ? 'text-foreground bg-card' : 'text-muted-foreground hover:text-foreground/80 hover:bg-muted/30'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="flex items-center justify-center gap-2">
                  <Icon className={cn('w-4 h-4', isActive ? 'text-primary' : '')} />
                  {t(tab)}
                  {goals.length > 0 && (
                    <span className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full tabular-nums',
                      done === goals.length
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : isActive ? 'bg-primary/10 text-primary' : 'bg-muted/60 text-muted-foreground'
                    )}>
                      {done}/{goals.length}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Celebration banner */}
          <AnimatePresence>
            {celebratingTab === activeTab && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                className="mb-5 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-4"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-500">
                    {activeTab === 'daily' ? t('allDailyCompleted') : t('allWeeklyCompleted')}
                  </p>
                  <p className="text-xs text-emerald-500/70 mt-0.5">{t('celebration')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3">
              <span className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="py-10 text-center text-sm text-red-500">{t('errorLoad')}</p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                <GoalList
                  goals={currentGoals}
                  subjects={subjects}
                  onToggle={toggleGoal}
                  onSetProgress={setNumericProgress}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  emptyMessage={t('noGoals')}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <GoalModal
            open={modalOpen}
            goal={editGoal}
            subjects={subjects}
            onClose={() => setModalOpen(false)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
