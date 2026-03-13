'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Goal } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

// ── Reset tracking via localStorage ──────────────────────────────────────────

const DAILY_RESET_KEY = 'grindboard_goals_daily_reset';
const WEEKLY_RESET_KEY = 'grindboard_goals_weekly_reset';
const SIDEBAR_KEY = 'grindboard_goals_sidebar';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function getWeekKey() {
  const d = new Date();
  // Monday-based week number
  const day = d.getDay() === 0 ? 6 : d.getDay() - 1;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day);
  return `${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
}

function shouldResetDaily(): boolean {
  if (typeof window === 'undefined') return false;
  const last = localStorage.getItem(DAILY_RESET_KEY);
  return last !== getTodayKey();
}

function shouldResetWeekly(): boolean {
  if (typeof window === 'undefined') return false;
  const last = localStorage.getItem(WEEKLY_RESET_KEY);
  return last !== getWeekKey();
}

function markDailyReset() {
  localStorage.setItem(DAILY_RESET_KEY, getTodayKey());
}

function markWeeklyReset() {
  localStorage.setItem(WEEKLY_RESET_KEY, getWeekKey());
}

// ── Sidebar summary (persisted for fast sidebar reads) ────────────────────────

export interface GoalsSidebarSummary {
  todayDone: number;
  todayTotal: number;
}

export function getGoalsSidebarSummary(): GoalsSidebarSummary {
  if (typeof window === 'undefined') return { todayDone: 0, todayTotal: 0 };
  try {
    return JSON.parse(localStorage.getItem(SIDEBAR_KEY) ?? '{"todayDone":0,"todayTotal":0}');
  } catch {
    return { todayDone: 0, todayTotal: 0 };
  }
}

function saveSidebarSummary(goals: Goal[]) {
  const daily = goals.filter(g => g.category === 'daily');
  const todayDone = daily.filter(g => g.is_completed).length;
  const todayTotal = daily.length;
  localStorage.setItem(SIDEBAR_KEY, JSON.stringify({ todayDone, todayTotal }));
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    let goals = (data ?? []) as Goal[];

    // Daily reset
    if (shouldResetDaily()) {
      const dailyIds = goals
        .filter(g => g.category === 'daily' && g.is_completed)
        .map(g => g.id);
      if (dailyIds.length > 0) {
        await supabase
          .from('goals')
          .update({ is_completed: false, progress_current: 0, completed_at: null })
          .in('id', dailyIds);
        goals = goals.map(g =>
          dailyIds.includes(g.id)
            ? { ...g, is_completed: false, progress_current: 0, completed_at: null }
            : g
        );
      }
      markDailyReset();
    }

    // Weekly reset
    if (shouldResetWeekly()) {
      const weeklyIds = goals
        .filter(g => g.category === 'weekly' && g.is_completed)
        .map(g => g.id);
      if (weeklyIds.length > 0) {
        await supabase
          .from('goals')
          .update({ is_completed: false, progress_current: 0, completed_at: null })
          .in('id', weeklyIds);
        goals = goals.map(g =>
          weeklyIds.includes(g.id)
            ? { ...g, is_completed: false, progress_current: 0, completed_at: null }
            : g
        );
      }
      markWeeklyReset();
    }

    setGoals(goals);
    saveSidebarSummary(goals);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const addGoal = useCallback(async (input: {
    title: string;
    category: Goal['category'];
    priority: Goal['priority'];
    progress_type: Goal['progress_type'];
    progress_target: number;
    subject_id?: string | null;
    target_date?: string | null;
    note?: string | null;
  }) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        title: input.title,
        category: input.category,
        priority: input.priority,
        progress_type: input.progress_type,
        progress_target: input.progress_target,
        progress_current: 0,
        subject_id: input.subject_id ?? null,
        target_date: input.target_date ?? null,
        note: input.note ?? null,
      })
      .select()
      .single();
    if (error || !data) return null;
    const newGoals = [data as Goal, ...goals];
    setGoals(newGoals);
    saveSidebarSummary(newGoals);
    return data as Goal;
  }, [supabase, goals]);

  const updateGoal = useCallback(async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id);
    if (error) return false;
    const newGoals = goals.map(g => g.id === id ? { ...g, ...updates } : g);
    setGoals(newGoals);
    saveSidebarSummary(newGoals);
    return true;
  }, [supabase, goals]);

  const toggleGoal = useCallback(async (goal: Goal) => {
    const isCompleted = !goal.is_completed;
    const updates: Partial<Goal> = {
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      ...(goal.progress_type === 'checkbox'
        ? { progress_current: isCompleted ? 1 : 0 }
        : {}),
    };
    return updateGoal(goal.id, updates);
  }, [updateGoal]);

  const setNumericProgress = useCallback(async (goal: Goal, value: number) => {
    const clamped = Math.max(0, Math.min(value, goal.progress_target));
    const isCompleted = clamped >= goal.progress_target;
    return updateGoal(goal.id, {
      progress_current: clamped,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    });
  }, [updateGoal]);

  const deleteGoal = useCallback(async (id: string) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) return false;
    const newGoals = goals.filter(g => g.id !== id);
    setGoals(newGoals);
    saveSidebarSummary(newGoals);
    return true;
  }, [supabase, goals]);

  const dailyGoals = goals.filter(g => g.category === 'daily');
  const weeklyGoals = goals.filter(g => g.category === 'weekly');
  const generalGoals = goals.filter(g => g.category === 'general');

  return {
    goals,
    dailyGoals,
    weeklyGoals,
    generalGoals,
    loading,
    error,
    addGoal,
    updateGoal,
    toggleGoal,
    setNumericProgress,
    deleteGoal,
    refetch: fetchGoals,
  };
}
