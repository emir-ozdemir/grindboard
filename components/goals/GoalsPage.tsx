'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Target, CheckCircle2, Circle, Trash2, Edit3,
  ChevronDown, ChevronUp, Flag, Hash, Calendar,
  Flame, TrendingUp, ListChecks, X, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGoals } from '@/lib/hooks/useGoals';
import type { Goal } from '@/types/database';
import type { Subject } from '@/types/database';

// ── Canvas confetti (lazy) ────────────────────────────────────────────────────

async function fireConfetti() {
  const confetti = (await import('canvas-confetti')).default;
  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#f59e0b', '#fbbf24', '#d97706', '#10b981', '#34d399'] });
}

// ── Priority badge ─────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  low:    { color: 'text-blue-500',   bg: 'bg-blue-500/10 border-blue-500/25' },
  medium: { color: 'text-amber-500',  bg: 'bg-amber-500/10 border-amber-500/25' },
  high:   { color: 'text-red-500',    bg: 'bg-red-500/10 border-red-500/25' },
};

// ── Add/Edit Modal ─────────────────────────────────────────────────────────────

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
  open,
  goal,
  subjects,
  onClose,
  onSave,
}: {
  open: boolean;
  goal: Goal | null;
  subjects: Subject[];
  onClose: () => void;
  onSave: (data: GoalFormData) => Promise<void>;
}) {
  const t = useTranslations('goals');
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="relative w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <h2 className="font-bold text-base">{goal ? t('editGoal') : t('addGoal')}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              {t('goalTitle')}
            </label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder={t('goalTitlePlaceholder')}
              className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/50 focus:bg-muted/50 transition-colors"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                {t('category')}
              </label>
              <select
                value={form.category}
                onChange={e => set('category', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
              >
                <option value="daily">{t('daily')}</option>
                <option value="weekly">{t('weekly')}</option>
                <option value="general">{t('general')}</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                {t('priority')}
              </label>
              <select
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
              >
                <option value="low">{t('priorityLow')}</option>
                <option value="medium">{t('priorityMedium')}</option>
                <option value="high">{t('priorityHigh')}</option>
              </select>
            </div>
          </div>

          {/* Progress type */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              {t('progressType')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['checkbox', 'numeric'] as const).map(pt => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => set('progress_type', pt)}
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm font-medium border transition-colors',
                    form.progress_type === pt
                      ? 'bg-primary/10 border-primary/40 text-primary'
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
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                {t('progressTarget')}
              </label>
              <input
                type="number"
                min={1}
                value={form.progress_target}
                onChange={e => set('progress_target', Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          )}

          {/* Subject */}
          {subjects.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                {t('selectSubject')}
              </label>
              <select
                value={form.subject_id}
                onChange={e => set('subject_id', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
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
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                {t('targetDate')}
              </label>
              <input
                type="date"
                value={form.target_date}
                onChange={e => set('target_date', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          )}

          {/* Note */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
              {t('note')}
            </label>
            <textarea
              value={form.note}
              onChange={e => set('note', e.target.value)}
              placeholder={t('notePlaceholder')}
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border/40 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border/50 text-sm font-medium hover:bg-muted/30 transition-colors"
          >
            {/* common.cancel */}
            İptal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="flex-1 py-2.5 rounded-xl btn-gradient text-white text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{t('saving')}</>
            ) : (
              <><Check className="w-4 h-4" />{t('addGoal')}</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Goal Item ──────────────────────────────────────────────────────────────────

function GoalItem({
  goal,
  subjects,
  onToggle,
  onSetProgress,
  onEdit,
  onDelete,
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
        'group rounded-xl border transition-all duration-200',
        goal.is_completed
          ? 'border-border/20 bg-muted/10'
          : 'border-border/40 bg-card hover:border-border/70'
      )}
    >
      <div className="flex items-start gap-3 p-3.5">
        {/* Checkbox */}
        <button
          onClick={onToggle}
          className="mt-0.5 shrink-0 transition-transform hover:scale-110"
        >
          {goal.is_completed
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            : <Circle className="w-5 h-5 text-muted-foreground/50 hover:text-primary" />
          }
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'text-sm font-medium leading-snug',
              goal.is_completed ? 'line-through text-muted-foreground/50' : 'text-foreground'
            )}>
              {goal.title}
            </span>
            {/* Priority badge */}
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md border',
              pCfg.bg, pCfg.color
            )}>
              <Flag className="w-2.5 h-2.5" />
              {t(goal.priority)}
            </span>
            {/* Subject dot */}
            {subject && (
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="w-2 h-2 rounded-full" style={{ background: subject.color }} />
                {subject.name}
              </span>
            )}
          </div>

          {/* Numeric progress */}
          {goal.progress_type === 'numeric' && !goal.is_completed && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums">
                {goal.progress_current}{t('of')}{goal.progress_target}
              </span>
            </div>
          )}

          {/* Target date */}
          {goal.target_date && (
            <div className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground/60">
              <Calendar className="w-3 h-3" />
              {goal.target_date}
            </div>
          )}

          {/* Note (expandable) */}
          {goal.note && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="flex items-center gap-1 mt-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              {expanded ? goal.note : goal.note.slice(0, 40) + (goal.note.length > 40 ? '...' : '')}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {goal.progress_type === 'numeric' && !goal.is_completed && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSetProgress(goal.progress_current - 1)}
                className="w-6 h-6 rounded-md hover:bg-muted/50 flex items-center justify-center text-xs font-bold"
              >−</button>
              <button
                onClick={() => onSetProgress(goal.progress_current + 1)}
                className="w-6 h-6 rounded-md hover:bg-muted/50 flex items-center justify-center text-xs font-bold"
              >+</button>
            </div>
          )}
          <button onClick={onEdit} className="w-7 h-7 rounded-lg hover:bg-muted/50 flex items-center justify-center">
            <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center">
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500 transition-colors" />
          </button>
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
    {
      icon: Flame,
      label: t('todaySummary'),
      goals: dailyGoals,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: TrendingUp,
      label: t('weekSummary'),
      goals: weeklyGoals,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      icon: ListChecks,
      label: t('generalSummary'),
      goals: generalGoals,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {cards.map(({ icon: Icon, label, goals, color, bg }) => {
        const done = goals.filter(g => g.is_completed).length;
        const total = goals.length;
        return (
          <motion.div
            key={label}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={cn('rounded-xl border p-3.5', bg)}
          >
            <div className={cn('w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center mb-2', bg)}>
              <Icon className={cn('w-4 h-4', color)} />
            </div>
            <div className="text-[11px] text-muted-foreground font-medium">{label}</div>
            <div className={cn('text-xl font-extrabold tabular-nums mt-0.5', color)}>
              {done}<span className="text-sm font-semibold text-muted-foreground">/{total}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Tab Panel ──────────────────────────────────────────────────────────────────

function GoalList({
  goals,
  subjects,
  onToggle,
  onSetProgress,
  onEdit,
  onDelete,
  emptyMessage,
}: {
  goals: Goal[];
  subjects: Subject[];
  onToggle: (g: Goal) => void;
  onSetProgress: (g: Goal, v: number) => void;
  onEdit: (g: Goal) => void;
  onDelete: (g: Goal) => void;
  emptyMessage: string;
}) {
  if (goals.length === 0) {
    return (
      <div className="py-16 text-center">
        <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  // Sort: incomplete first, then by priority (high→low)
  const priorityOrder: Record<Goal['priority'], number> = { high: 0, medium: 1, low: 2 };
  const sorted = [...goals].sort((a, b) => {
    if (a.is_completed !== b.is_completed) return a.is_completed ? 1 : -1;
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="space-y-2">
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

  // Fire confetti when all goals in a tab become complete
  useEffect(() => {
    for (const tab of TABS) {
      const goals = tabGoals[tab];
      if (goals.length === 0) continue;
      const done = goals.filter(g => g.is_completed).length;
      if (done === goals.length && prevCompleted.current[tab] !== goals.length) {
        if (prevCompleted.current[tab] !== -1) {
          setCelebratingTab(tab);
          fireConfetti();
          setTimeout(() => setCelebratingTab(null), 3000);
        }
      }
      prevCompleted.current[tab] = done;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dailyGoals, weeklyGoals, generalGoals]);

  const openAdd = () => { setEditGoal(null); setModalOpen(true); };
  const openEdit = (g: Goal) => { setEditGoal(g); setModalOpen(true); };

  const handleSave = useCallback(async (data: {
    title: string; category: Goal['category']; priority: Goal['priority'];
    progress_type: Goal['progress_type']; progress_target: number;
    subject_id: string; target_date: string; note: string;
  }) => {
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
  const doneCount = currentGoals.filter(g => g.is_completed).length;
  const allDone = currentGoals.length > 0 && doneCount === currentGoals.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t('title')}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t('dailyResetNote')}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-gradient text-white text-sm font-bold shadow-lg"
        >
          <Plus className="w-4 h-4" />
          {t('addGoal')}
        </motion.button>
      </div>

      {/* Summary */}
      <SummaryCards
        dailyGoals={dailyGoals}
        weeklyGoals={weeklyGoals}
        generalGoals={generalGoals}
      />

      {/* Tabs */}
      <div className="bg-card border border-border/40 rounded-2xl overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-border/40">
          {TABS.map(tab => {
            const goals = tabGoals[tab];
            const done = goals.filter(g => g.is_completed).length;
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-3.5 text-sm font-semibold transition-colors relative',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground/70'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                  />
                )}
                <span className="flex items-center justify-center gap-1.5">
                  {t(tab)}
                  {goals.length > 0 && (
                    <span className={cn(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                      done === goals.length
                        ? 'bg-emerald-500/15 text-emerald-500'
                        : 'bg-muted/50 text-muted-foreground'
                    )}>
                      {done}/{goals.length}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="p-4">
          <AnimatePresence>
            {celebratingTab === activeTab && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 flex items-center gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 px-4 py-3"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-sm font-semibold text-emerald-500">
                  {activeTab === 'daily' ? t('allDailyCompleted') : t('allWeeklyCompleted')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="py-12 flex justify-center">
              <span className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-red-500">{t('errorLoad')}</p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
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
