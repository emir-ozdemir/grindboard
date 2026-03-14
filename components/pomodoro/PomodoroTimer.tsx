'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Play, Pause, RotateCcw, Plus, Trash2, Check, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePomodoro, type PomodoroMode } from '@/lib/hooks/usePomodoro';
import { usePomodoroPresets } from '@/lib/hooks/usePomodoroPresets';
import { usePomodoroFlow, type FlowBlock } from '@/lib/hooks/usePomodoroFlow';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SmokeBackground } from './SmokeBackground';
import { SubjectSelector } from './SubjectSelector';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';
import type { Subject } from '@/types/database';

// ─── Constants ────────────────────────────────────────────────────────────────

const RADIUS = 130;
const SVG_SIZE = 300;
const CX = SVG_SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

type RingKey = PomodoroMode | 'break';

const RING_COLORS: Record<RingKey, { stroke: string; glow: string; text: string }> = {
  work:       { stroke: '#f59e0b', glow: 'drop-shadow(0 0 20px rgba(245,158,11,0.75))', text: 'text-amber-400' },
  shortBreak: { stroke: '#84cc16', glow: 'drop-shadow(0 0 20px rgba(132,204,22,0.65))', text: 'text-lime-400' },
  longBreak:  { stroke: '#38bdf8', glow: 'drop-shadow(0 0 20px rgba(56,189,248,0.65))', text: 'text-sky-400' },
  break:      { stroke: '#38bdf8', glow: 'drop-shadow(0 0 20px rgba(56,189,248,0.65))', text: 'text-sky-400' },
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function TimerRing({
  progress,
  colorKey,
  isRunning,
  minutes,
  seconds,
  label,
}: {
  progress: number;
  colorKey: RingKey;
  isRunning: boolean;
  minutes: string;
  seconds: string;
  label: string;
}) {
  const c = RING_COLORS[colorKey];
  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        className="-rotate-90"
        style={{ filter: isRunning ? c.glow : undefined }}
      >
        <circle cx={CX} cy={CX} r={RADIUS} fill="none" strokeWidth="6" className="stroke-border/40" />
        <circle
          cx={CX} cy={CX} r={RADIUS} fill="none" strokeWidth="6"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE - progress}
          strokeLinecap="round"
          stroke={c.stroke}
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className={cn('font-mono tabular-nums font-bold leading-none', c.text)}
            style={{ fontSize: '5rem' }}
          >
            {minutes}:{seconds}
          </motion.span>
        </AnimatePresence>
        <span className="text-sm text-muted-foreground font-medium mt-1">{label}</span>
      </div>
    </div>
  );
}

/** Row of controls: [Reset] [Play/Pause] [Settings⚙] */
function Controls({
  isRunning,
  onStart,
  onPause,
  onReset,
  disabled = false,
  settingsContent,
  settingsTitle,
}: {
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  disabled?: boolean;
  settingsContent: React.ReactNode;
  settingsTitle: string;
}) {
  return (
    <div className="flex items-center gap-5">
      <button
        onClick={onReset}
        className="h-11 w-11 rounded-full flex items-center justify-center bg-muted/60 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <button
        onClick={isRunning ? onPause : onStart}
        disabled={disabled}
        className={cn(
          'h-16 w-16 rounded-full flex items-center justify-center btn-gradient text-white shadow-lg transition-transform',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95',
        )}
      >
        {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
      </button>

      <Sheet>
        <SheetTrigger asChild>
          <button className="h-11 w-11 rounded-full flex items-center justify-center bg-muted/60 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <Settings className="h-4 w-4" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[340px] overflow-y-auto border-l border-border/40 bg-background/95 backdrop-blur-xl"
        >
          <SheetHeader className="pb-2">
            <SheetTitle>{settingsTitle}</SheetTitle>
          </SheetHeader>
          {settingsContent}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PomodoroTimerProps {
  userId: string;
  subjects: Subject[];
}

// ─── Manuel Section ───────────────────────────────────────────────────────────

function ManualSection({ userId, subjects }: PomodoroTimerProps) {
  const t = useTranslations('pomodoro');
  const tc = useTranslations('common');
  const { toast } = useToast();
  const supabase = createClient();

  const { presets, activeId, activePreset, activatePreset, addPreset, deletePreset } =
    usePomodoroPresets();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [todayCount, setTodayCount] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ name: '', work: '25', short: '5', long: '15' });

  const handleSessionComplete = useCallback(
    async (durationMinutes: number) => {
      if (durationMinutes < 1) return;
      await supabase.from('study_sessions').insert({
        user_id: userId,
        subject_id: selectedSubjectId,
        duration_minutes: durationMinutes,
        session_type: 'pomodoro',
        started_at: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      });
      setTodayCount((c) => c + 1);
      setTodayMinutes((m) => m + durationMinutes);
      toast({ title: t('sessionSaved'), description: `${durationMinutes} ${t('min')}` });
    },
    [userId, selectedSubjectId, supabase, t, toast],
  );

  const { mode, setMode, timeLeft, isRunning, settings, start, pause, reset, updateSettings } =
    usePomodoro(handleSessionComplete);

  useEffect(() => {
    if (activePreset) {
      updateSettings({
        workDuration: activePreset.workDuration,
        shortBreakDuration: activePreset.shortBreakDuration,
        longBreakDuration: activePreset.longBreakDuration,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Keyboard shortcuts: Space = toggle, R = reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      if (e.key === ' ') { e.preventDefault(); if (isRunning) { pause(); } else { start(); } }
      else if (e.key === 'r' || e.key === 'R') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRunning, start, pause, reset]);

  const totalSeconds =
    mode === 'work'
      ? settings.workDuration * 60
      : mode === 'shortBreak'
      ? settings.shortBreakDuration * 60
      : settings.longBreakDuration * 60;

  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * CIRCUMFERENCE : CIRCUMFERENCE;
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  const modes: { key: PomodoroMode; label: string }[] = [
    { key: 'work', label: t('work') },
    { key: 'shortBreak', label: t('shortBreak') },
    { key: 'longBreak', label: t('longBreak') },
  ];

  const handleAddPreset = () => {
    const w = parseInt(form.work, 10);
    const s = parseInt(form.short, 10);
    const l = parseInt(form.long, 10);
    if (!form.name.trim() || isNaN(w) || isNaN(s) || isNaN(l)) return;
    const preset = addPreset({
      name: form.name.trim(),
      workDuration: w,
      shortBreakDuration: s,
      longBreakDuration: l,
    });
    activatePreset(preset.id);
    setForm({ name: '', work: '25', short: '5', long: '15' });
    setShowAddForm(false);
  };

  const settingsContent = (
    <div className="space-y-7 pt-2">
      {/* Subject */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('subject')}</p>
        <SubjectSelector
          subjects={subjects}
          selectedId={selectedSubjectId}
          onSelect={setSelectedSubjectId}
        />
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('presets')}
        </p>
        <div className="flex flex-col gap-2">
          {presets.map((preset) => {
            const defaultNames: Record<string, string> = {
              classic: t('presetClassic'),
              deep: t('presetDeep'),
              sprint: t('presetSprint'),
            };
            const displayName = defaultNames[preset.id] ?? preset.name;
            return (
            <div
              key={preset.id}
              className={cn(
                'flex items-center justify-between rounded-xl border px-3 py-2.5 cursor-pointer transition-all',
                activeId === preset.id
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-muted/50 border-border/40 hover:bg-muted',
              )}
              onClick={() => activatePreset(preset.id)}
            >
              <div>
                <p className={cn('text-sm font-medium', activeId === preset.id ? 'text-amber-400' : 'text-foreground')}>
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {preset.workDuration}{t('min')} / {preset.shortBreakDuration}{t('min')} / {preset.longBreakDuration}{t('min')}
                </p>
              </div>
              {!preset.isDefault && (
                <button
                  onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                  className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            );
          })}
        </div>

        {/* Add preset */}
        <button
          onClick={() => setShowAddForm((v) => !v)}
          className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-all"
        >
          <Plus className="h-3.5 w-3.5" />
          {t('newPreset')}
        </button>

        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
                <input
                  type="text"
                  placeholder={t('presetName')}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full bg-muted/50 border border-border/50 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
                />
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'work' as const, label: t('work') },
                      { key: 'short' as const, label: t('short') },
                      { key: 'long' as const, label: t('long') },
                    ] as const
                  ).map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-muted-foreground mb-1 block">{label} ({t('min')})</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        className="w-full bg-muted/50 border border-border/50 rounded-lg px-2 py-1.5 text-sm text-foreground text-center focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {tc('cancel')}
                  </button>
                  <button
                    onClick={handleAddPreset}
                    className="px-3 py-1.5 rounded-lg text-xs btn-gradient text-white flex items-center gap-1.5"
                  >
                    <Check className="h-3 w-3" /> {tc('save')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Today stats */}
      {todayCount > 0 && (
        <p className="text-xs text-muted-foreground text-center border-t border-border/30 pt-4">
          {t('todayStats', { count: todayCount, minutes: todayMinutes })}
        </p>
      )}
    </div>
  );

  return (
    <>
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 rounded-full backdrop-blur-sm bg-muted/60 border border-border/50">
        {modes.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              mode === key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <TimerRing
        progress={progress}
        colorKey={mode}
        isRunning={isRunning}
        minutes={minutes}
        seconds={seconds}
        label={modes.find((m) => m.key === mode)?.label ?? ''}
      />

      <Controls
        isRunning={isRunning}
        onStart={start}
        onPause={pause}
        onReset={reset}
        settingsContent={settingsContent}
        settingsTitle={t('settings.title')}
      />
    </>
  );
}

// ─── Otomatik Section ─────────────────────────────────────────────────────────

function AutoSection({ userId, subjects }: PomodoroTimerProps) {
  const t = useTranslations('pomodoro');
  const { toast } = useToast();
  const supabase = createClient();

  const [todayMinutes, setTodayMinutes] = useState(0);

  const handleBlockComplete = useCallback(
    async (block: FlowBlock, durationMinutes: number) => {
      if (durationMinutes < 1) return;
      await supabase.from('study_sessions').insert({
        user_id: userId,
        subject_id: block.subjectId ?? null,
        duration_minutes: durationMinutes,
        session_type: 'pomodoro',
        started_at: new Date(Date.now() - durationMinutes * 60 * 1000).toISOString(),
        ended_at: new Date().toISOString(),
      });
      setTodayMinutes((m) => m + durationMinutes);
      toast({ title: t('sessionSaved'), description: `${durationMinutes} ${t('min')}` });
    },
    [userId, supabase, toast],
  );

  const {
    blocks,
    addBlock,
    removeBlock,
    updateBlock,
    currentIndex,
    currentBlock,
    timeLeft,
    isRunning,
    isTransitioning,
    hasStarted,
    isComplete,
    totalDuration,
    start,
    pause,
    reset,
  } = usePomodoroFlow(handleBlockComplete);

  // Keyboard shortcuts: Space = toggle, R = reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      if (e.key === ' ') { e.preventDefault(); if (isRunning) { pause(); } else { start(); } }
      else if (e.key === 'r' || e.key === 'R') reset();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRunning, start, pause, reset]);

  const colorKey: RingKey = currentBlock?.type === 'work' ? 'work' : 'break';
  const totalSeconds = (currentBlock?.duration ?? 25) * 60;
  const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * CIRCUMFERENCE : CIRCUMFERENCE;
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');

  const blockLabel = hasStarted
    ? `${currentIndex + 1}/${blocks.length} — ${currentBlock?.type === 'work' ? t('subject') : t('break')}`
    : currentBlock?.type === 'work'
    ? t('subject')
    : t('break');

  const totalH = Math.floor(totalDuration / 60);
  const totalM = totalDuration % 60;

  /** The sequence builder lives inside the settings sheet */
  const settingsContent = (
    <div className="space-y-4 pt-2">
      {/* How it works */}
      <div className="rounded-xl bg-primary/[0.06] border border-primary/20 px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-primary shrink-0" />
          <p className="text-xs font-bold text-primary">{t('howTitle')}</p>
        </div>
        <ul className="space-y-1">
          {[t('how1'), t('how2'), t('how3')].map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('sequence')}</p>
        {totalDuration > 0 && (
          <span className="text-xs text-muted-foreground">
            {totalH > 0 ? `${totalH}${t('hourShort')} ` : ''}{totalM}{t('min')}
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {blocks.map((block, i) => (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-border/50 bg-muted/30 p-3 space-y-2.5">
              {/* Row 1: index, type toggle, duration, delete */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}.</span>
                <button
                  disabled={hasStarted}
                  onClick={() =>
                    updateBlock(block.id, {
                      type: block.type === 'work' ? 'break' : 'work',
                    })
                  }
                  className={cn(
                    'px-2.5 py-1 rounded-md text-xs font-medium border transition-all min-w-[50px]',
                    block.type === 'work'
                      ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      : 'bg-sky-500/15 border-sky-500/30 text-sky-400',
                    hasStarted && 'opacity-50 cursor-not-allowed',
                  )}
                >
                  {block.type === 'work' ? t('subject') : t('break')}
                </button>
                <input
                  type="number"
                  min="1"
                  max="180"
                  disabled={hasStarted}
                  value={block.duration}
                  onChange={(e) => {
                    const v = parseInt(e.target.value, 10);
                    if (!isNaN(v) && v > 0) updateBlock(block.id, { duration: v });
                  }}
                  className="w-14 text-center bg-muted/50 border border-border/50 rounded-md px-1 py-1 text-sm text-foreground focus:outline-none focus:border-amber-500/40 disabled:opacity-50"
                />
                <span className="text-xs text-muted-foreground">{t('min')}</span>
                <button
                  disabled={hasStarted}
                  onClick={() => removeBlock(block.id)}
                  className="ml-auto h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>

              {/* Row 2: subject selector (work blocks only) */}
              {block.type === 'work' && (
                <Select
                  disabled={hasStarted}
                  value={block.subjectId ?? 'none'}
                  onValueChange={(v) =>
                    updateBlock(block.id, { subjectId: v === 'none' ? null : v })
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50 disabled:opacity-50">
                    <SelectValue placeholder={t('selectSubjectOptional')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">{t('general')}</span>
                    </SelectItem>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Add buttons */}
      {!hasStarted && (
        <div className="flex gap-2">
          <button
            onClick={() => addBlock({ type: 'work', duration: 40 })}
            className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-dashed border-amber-500/30 py-2 text-xs text-amber-400/70 hover:text-amber-400 hover:border-amber-500/60 transition-all"
          >
            <Plus className="h-3 w-3" /> {t('subject')}
          </button>
          <button
            onClick={() => addBlock({ type: 'break', duration: 10 })}
            className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-dashed border-sky-500/30 py-2 text-xs text-sky-400/70 hover:text-sky-400 hover:border-sky-500/60 transition-all"
          >
            <Plus className="h-3 w-3" /> {t('break')}
          </button>
        </div>
      )}

      {todayMinutes > 0 && (
        <p className="text-xs text-muted-foreground text-center border-t border-border/30 pt-3">
          {t('todayStudied', { n: todayMinutes })}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex items-start gap-12 w-full justify-center">

      {/* ── Timer column ── */}
      <div className="flex flex-col items-center gap-8">
        <TimerRing
          progress={progress}
          colorKey={colorKey}
          isRunning={isRunning}
          minutes={mins}
          seconds={secs}
          label={blockLabel}
        />

        <Controls
          isRunning={isRunning}
          onStart={start}
          onPause={pause}
          onReset={reset}
          disabled={isTransitioning || blocks.length === 0}
          settingsContent={settingsContent}
          settingsTitle={t('setupSequence')}
        />

        {/* Summary before start (mobile only, sidebar handles desktop) */}
        {!hasStarted && blocks.length > 0 && (
          <p className="text-xs text-muted-foreground text-center -mt-2 lg:hidden">
            {blocks.length} {t('block')} · {totalH > 0 ? `${totalH}${t('hourShort')} ` : ''}{totalM}{t('min')} {t('total')}
          </p>
        )}

        {/* Status messages */}
        <AnimatePresence>
          {isComplete && (
            <motion.p
              key="complete"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-sm text-center text-foreground font-medium -mt-2"
            >
              {t('sequenceComplete')}
            </motion.p>
          )}
          {isTransitioning && !isComplete && (
            <motion.p
              key="transitioning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-center text-muted-foreground animate-pulse -mt-2"
            >
              {t('nextBlock')}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Mini timeline — mobile only */}
        {hasStarted && (
          <div className="lg:hidden w-full max-w-xs">
            <div className="flex gap-1.5 justify-center flex-wrap">
              {blocks.map((block, i) => (
                <div
                  key={block.id}
                  style={{ width: `${Math.max(Math.round(block.duration / 3), 14)}px` }}
                  className={cn(
                    'h-2 rounded-full transition-all duration-500',
                    i < currentIndex
                      ? 'bg-muted-foreground/40'
                      : i === currentIndex
                      ? block.type === 'work' ? 'bg-amber-400' : 'bg-sky-400'
                      : block.type === 'work' ? 'bg-amber-500/25' : 'bg-sky-500/25',
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {todayMinutes > 0 && (
          <p className="text-xs text-center text-muted-foreground -mt-4">
            {t('todayStudied', { n: todayMinutes })}
          </p>
        )}
      </div>

      {/* ── Sequence sidebar — desktop only ── */}
      {blocks.length > 0 && (
        <div className="hidden lg:flex flex-col gap-1.5 w-56 pt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t('sequence')}
            </p>
            <span className="text-xs text-muted-foreground tabular-nums">
              {totalH > 0 ? `${totalH}${t('hourShort')} ` : ''}{totalM}{t('min')}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[55vh] overflow-y-auto pr-1">
            {blocks.map((block, i) => {
              const isPast = isComplete || i < currentIndex;
              const isCurrent = !isComplete && i === currentIndex;
              const subject = block.subjectId
                ? subjects.find((s) => s.id === block.subjectId)
                : null;

              return (
                <div
                  key={block.id}
                  className={cn(
                    'flex items-start gap-2.5 rounded-xl border px-3 py-2.5 transition-all duration-500',
                    isPast
                      ? 'opacity-35 border-border/20 bg-transparent'
                      : isCurrent
                      ? block.type === 'work'
                        ? 'border-amber-500/50 bg-amber-500/10'
                        : 'border-sky-500/50 bg-sky-500/10'
                      : 'opacity-50 border-border/15 bg-transparent',
                  )}
                >
                  {/* State icon */}
                  <div
                    className={cn(
                      'mt-0.5 w-5 h-5 rounded-full shrink-0 flex items-center justify-center',
                      isPast
                        ? 'bg-muted'
                        : isCurrent
                        ? block.type === 'work' ? 'bg-amber-500' : 'bg-sky-500'
                        : 'bg-muted/70',
                    )}
                  >
                    {isPast ? (
                      <Check className="h-3 w-3 text-white" />
                    ) : isCurrent ? (
                      <motion.span
                        className="w-2 h-2 rounded-full bg-white block"
                        animate={{ scale: [1, 1.35, 1] }}
                        transition={{ repeat: Infinity, duration: 1.4 }}
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/30 block" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          isCurrent
                            ? block.type === 'work' ? 'text-amber-400' : 'text-sky-400'
                            : 'text-muted-foreground',
                        )}
                      >
                        {block.type === 'work' ? t('subject') : t('break')}
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {block.duration}{t('min')}
                      </span>
                    </div>
                    {subject && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: subject.color }}
                        />
                        <span className="text-[11px] text-muted-foreground truncate">
                          {subject.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function PomodoroTimer({ userId, subjects }: PomodoroTimerProps) {
  const t = useTranslations('pomodoro');
  const [timerMode, setTimerMode] = useState<'manual' | 'auto'>('manual');

  return (
    <div
      className="relative flex flex-col items-center justify-center overflow-hidden -m-4 md:-m-6"
      style={{ minHeight: 'calc(100vh - 3.5rem)' }}
    >
      <SmokeBackground />

      <div className={cn(
          'relative z-10 flex flex-col items-center gap-8 w-full px-6 py-10',
          timerMode === 'manual' ? 'max-w-lg' : 'max-w-4xl',
        )}>
        {/* Manuel / Otomatik switch */}
        <div className="flex gap-1 p-1 rounded-full backdrop-blur-sm bg-muted/60 border border-border/50">
          <button
            onClick={() => setTimerMode('manual')}
            className={cn(
              'px-5 py-1.5 rounded-full text-sm font-medium transition-all',
              timerMode === 'manual'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('manual')}
          </button>
          <button
            onClick={() => setTimerMode('auto')}
            className={cn(
              'px-5 py-1.5 rounded-full text-sm font-medium transition-all',
              timerMode === 'auto'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t('auto')}
          </button>
        </div>

        {timerMode === 'manual' ? (
          <ManualSection userId={userId} subjects={subjects} />
        ) : (
          <AutoSection userId={userId} subjects={subjects} />
        )}
      </div>
    </div>
  );
}
