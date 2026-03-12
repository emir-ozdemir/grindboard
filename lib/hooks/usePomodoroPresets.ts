'use client';

import { useState, useCallback } from 'react';

export interface PomodoroPreset {
  id: string;
  name: string;
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  isDefault?: boolean;
}

export const DEFAULT_PRESETS: PomodoroPreset[] = [
  { id: 'classic',   name: 'Klasik',        workDuration: 25, shortBreakDuration: 5,  longBreakDuration: 15, isDefault: true },
  { id: 'deep',      name: 'Derin Çalışma',  workDuration: 50, shortBreakDuration: 10, longBreakDuration: 25, isDefault: true },
  { id: 'sprint',    name: 'Sprint',         workDuration: 15, shortBreakDuration: 3,  longBreakDuration: 10, isDefault: true },
];

const STORAGE_KEY = 'pomodoroPresets';
const ACTIVE_KEY  = 'pomodoroActivePreset';

function load(): PomodoroPreset[] {
  if (typeof window === 'undefined') return DEFAULT_PRESETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_PRESETS;
  } catch {
    return DEFAULT_PRESETS;
  }
}

function save(presets: PomodoroPreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
}

export function usePomodoroPresets() {
  const [presets, setPresets] = useState<PomodoroPreset[]>(load);
  const [activeId, setActiveId] = useState<string>(() => {
    if (typeof window === 'undefined') return 'classic';
    return localStorage.getItem(ACTIVE_KEY) ?? 'classic';
  });

  const activatePreset = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem(ACTIVE_KEY, id);
  }, []);

  const addPreset = useCallback(
    (data: Omit<PomodoroPreset, 'id' | 'isDefault'>): PomodoroPreset => {
      const preset: PomodoroPreset = { ...data, id: `custom-${Date.now()}` };
      const updated = [...presets, preset];
      setPresets(updated);
      save(updated);
      return preset;
    },
    [presets],
  );

  const deletePreset = useCallback(
    (id: string) => {
      const updated = presets.filter((p) => p.id !== id);
      setPresets(updated);
      save(updated);
      if (activeId === id) {
        const fallback = updated[0]?.id ?? 'classic';
        setActiveId(fallback);
        localStorage.setItem(ACTIVE_KEY, fallback);
      }
    },
    [presets, activeId],
  );

  const activePreset = presets.find((p) => p.id === activeId) ?? presets[0];

  return { presets, activeId, activePreset, activatePreset, addPreset, deletePreset };
}
