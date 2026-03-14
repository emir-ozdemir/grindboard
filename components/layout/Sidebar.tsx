'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import {
  ArrowRight,
  LayoutDashboard,
  Timer,
  Calendar,
  BookMarked,
  BarChart3,
  Settings,
  GraduationCap,
  NotebookPen,
  Sparkles,
  Target,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Exam } from '@/lib/hooks/useExams';
import { getGoalsSidebarSummary, useGoals } from '@/lib/hooks/useGoals';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  { key: 'dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'pomodoro', icon: Timer, href: '/pomodoro' },
  { key: 'schedule', icon: Calendar, href: '/schedule' },
  { key: 'topics', icon: BookMarked, href: '/topics' },
  { key: 'goals', icon: Target, href: '/goals' },
  { key: 'notes', icon: NotebookPen, href: '/notes' },
  { key: 'stats', icon: BarChart3, href: '/stats' },
  { key: 'exams', icon: GraduationCap, href: '/exams' },
  { key: 'settings', icon: Settings, href: '/settings' },
  { key: 'subscribe', icon: Sparkles, href: '/subscribe' },
] as const;

interface NavItemProps {
  href: string;
  label: string;
  isActive: boolean;
}

function NavItem({ href, label, isActive }: NavItemProps) {
  return (
    <Link href={href} className="block relative">
      {/* Amber left border for active */}
      {isActive && (
        <motion.span
          layoutId="active-indicator"
          className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-primary"
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        />
      )}

      <motion.div
        className={cn(
          'relative flex items-center gap-3 px-5 py-2.5 cursor-pointer select-none rounded-lg',
          isActive ? 'bg-primary/[0.08]' : ''
        )}
        initial="rest"
        whileHover="hover"
        animate={isActive ? 'active' : 'rest'}
      >
        {/* Sliding arrow indicator */}
        <motion.div
          variants={{
            rest: { x: -14, opacity: 0 },
            hover: { x: 0, opacity: 1 },
            active: { x: 0, opacity: 1 },
          }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="shrink-0"
        >
          <ArrowRight
            className={cn(
              'h-3.5 w-3.5',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />
        </motion.div>

        {/* Label */}
        <motion.span
          variants={{
            rest: { x: -6 },
            hover: { x: 0 },
            active: { x: 0 },
          }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className={cn(
            'text-sm font-medium leading-none',
            isActive ? 'text-primary' : 'text-muted-foreground'
          )}
        >
          {label}
        </motion.span>
      </motion.div>
    </Link>
  );
}

// ─── Mini exam countdown widget ───────────────────────────────────────────────

function NearestExamWidget() {
  const [nearest, setNearest] = useState<{ name: string; days: number; color: string } | null>(null);
  const params = useParams();
  const locale = params.locale as string;

  const update = useCallback(() => {
    try {
      const raw = localStorage.getItem('grindboard_exams');
      const all: Exam[] = raw ? JSON.parse(raw) : [];
      const upcoming = all
        .filter((e) => !e.archived && new Date(e.date).getTime() > Date.now())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (upcoming.length === 0) {
        setNearest(null);
        return;
      }

      const next = upcoming[0];
      const diff = new Date(next.date).getTime() - Date.now();
      const days = Math.ceil(diff / 86400000);
      setNearest({ name: next.name, days, color: next.color });
    } catch {
      setNearest(null);
    }
  }, []);

  useEffect(() => {
    update();
    const interval = setInterval(update, 60000);
    window.addEventListener('exams-updated', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('exams-updated', update);
    };
  }, [update]);

  const te = useTranslations('exams');
  if (!nearest) return null;

  return (
    <Link href={`/${locale}/exams`} className="block mx-3 mb-3">
      <div className="px-3 py-2.5 rounded-xl bg-primary/[0.06] border border-border/30 cursor-pointer hover:bg-primary/[0.12] transition-colors">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold mb-1.5">
          {te('upcomingExam')}
        </p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <div
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: nearest.color }}
            />
            <p className="text-xs font-medium text-foreground truncate">{nearest.name}</p>
          </div>
          <span
            className="text-xs font-bold tabular-nums shrink-0"
            style={{ color: nearest.color }}
          >
            {nearest.days === 0 ? te('today') : te('daysShort', { n: nearest.days })}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Goals sheet content ───────────────────────────────────────────────────────

function GoalsSheetContent({ locale }: { locale: string }) {
  const { dailyGoals, loading, toggleGoal } = useGoals();
  const tg = useTranslations('goals');

  const done = dailyGoals.filter((g) => g.is_completed).length;
  const total = dailyGoals.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = done === total && total > 0;

  return (
    <>
      <SheetHeader className="pb-4 border-b border-border/40">
        <SheetTitle className="text-base">{tg('todaySummary')}</SheetTitle>
      </SheetHeader>

      <div className="mt-4 flex flex-col gap-4">
        {total > 0 && (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">{tg('completedCount', { done, total })}</span>
              <span className={cn('font-bold tabular-nums', allDone ? 'text-emerald-500' : 'text-primary')}>
                {pct}%
              </span>
            </div>
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', allDone ? 'bg-emerald-500' : 'bg-primary')}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            ...
          </div>
        ) : total === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <p className="text-sm text-muted-foreground">{tg('noGoals')}</p>
            <Link href={`/${locale}/goals`} className="text-xs text-primary hover:underline">
              {tg('addFirst')}
            </Link>
          </div>
        ) : (
          <div className="space-y-0.5">
            {dailyGoals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                  goal.is_completed ? 'opacity-60' : 'hover:bg-muted/30'
                )}
              >
                {goal.is_completed
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  : <Circle className="h-4 w-4 shrink-0 text-muted-foreground" />
                }
                <span className={cn('text-sm flex-1', goal.is_completed && 'line-through text-muted-foreground')}>
                  {goal.title}
                </span>
              </button>
            ))}
          </div>
        )}

        <Link
          href={`/${locale}/goals`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          {tg('viewAll')} →
        </Link>
      </div>
    </>
  );
}

// ─── Daily Goals Widget ───────────────────────────────────────────────────────

function DailyGoalsWidget() {
  const [summary, setSummary] = useState<{ todayDone: number; todayTotal: number } | null>(null);
  const [open, setOpen] = useState(false);
  const params = useParams();
  const locale = params.locale as string;

  const update = useCallback(() => {
    const s = getGoalsSidebarSummary();
    if (s.todayTotal > 0) setSummary(s);
    else setSummary(null);
  }, []);

  useEffect(() => {
    update();
    const interval = setInterval(update, 10000);
    window.addEventListener('goals-updated', update);
    return () => {
      clearInterval(interval);
      window.removeEventListener('goals-updated', update);
    };
  }, [update]);

  const tg = useTranslations('goals');
  if (!summary) return null;

  const pct = Math.round((summary.todayDone / summary.todayTotal) * 100);
  const allDone = summary.todayDone === summary.todayTotal;

  return (
    <>
      <div
        role="button"
        onClick={() => setOpen(true)}
        className="mx-3 mb-2 px-3 py-2.5 rounded-xl bg-primary/[0.06] border border-border/30 cursor-pointer hover:bg-primary/[0.12] transition-colors"
      >
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground/60 font-semibold">
            {tg('todaySummary')}
          </p>
          <span className={cn(
            'text-[10px] font-bold tabular-nums',
            allDone ? 'text-emerald-500' : 'text-primary'
          )}>
            {summary.todayDone}/{summary.todayTotal}
          </span>
        </div>
        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', allDone ? 'bg-emerald-500' : 'bg-primary')}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80 sm:w-96">
          {open && <GoalsSheetContent locale={locale} />}
        </SheetContent>
      </Sheet>
    </>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;

  return (
    <aside className="hidden md:flex flex-col w-60 min-h-screen border-r border-border/40 bg-sidebar">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 16 16"
              className="w-4 h-4 text-primary-foreground"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="3" width="12" height="10" rx="1.5" />
              <path d="M5 7h6M5 10h4" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight">GrindBoard</span>
        </div>
      </div>

      <div className="h-px bg-border/30 mx-5 mb-5" />

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item) => {
          const href = `/${locale}${item.href}`;
          const isActive = pathname === href || pathname.startsWith(href + '/');

          return (
            <NavItem
              key={item.key}
              href={href}
              label={t(item.key)}
              isActive={isActive}
            />
          );
        })}
      </nav>

      {/* Daily goals widget */}
      <DailyGoalsWidget />

      {/* Nearest exam widget */}
      <NearestExamWidget />

      {/* Bottom */}
      <div className="px-6 py-5">
        <p className="text-[10px] text-muted-foreground/30">
          © {new Date().getFullYear()} GrindBoard
        </p>
      </div>
    </aside>
  );
}
