'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Exam {
  id: string;
  name: string;
  date: string; // datetime-local: "2026-06-15T09:00"
  color: string;
  archived: boolean;
  createdAt: string;
}

export function getCountdown(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    total: diff,
  };
}

const KEY = 'grindboard_exams';

function load(): Exam[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? '[]'); } catch { return []; }
}

function persist(exams: Exam[]) {
  localStorage.setItem(KEY, JSON.stringify(exams));
  window.dispatchEvent(new CustomEvent('exams-updated'));
}

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);

  useEffect(() => {
    setExams(load());
    const onUpdate = () => setExams(load());
    window.addEventListener('exams-updated', onUpdate);
    return () => window.removeEventListener('exams-updated', onUpdate);
  }, []);

  // ── Mutations: always read from localStorage (no functional updaters)
  // to avoid React StrictMode double-invocation side effects ────────────

  const addExam = useCallback((data: Pick<Exam, 'name' | 'date' | 'color'>) => {
    const next = [
      ...load(),
      { id: crypto.randomUUID(), ...data, archived: false, createdAt: new Date().toISOString() },
    ];
    persist(next);
    setExams(next);
  }, []);

  const updateExam = useCallback((id: string, data: Partial<Pick<Exam, 'name' | 'date' | 'color'>>) => {
    const next = load().map((e) => (e.id === id ? { ...e, ...data } : e));
    persist(next);
    setExams(next);
  }, []);

  const deleteExam = useCallback((id: string) => {
    const next = load().filter((e) => e.id !== id);
    persist(next);
    setExams(next);
  }, []);

  const archiveExam = useCallback((id: string) => {
    const next = load().map((e) => (e.id === id ? { ...e, archived: true } : e));
    persist(next);
    setExams(next);
  }, []);

  return { exams, addExam, updateExam, deleteExam, archiveExam };
}
