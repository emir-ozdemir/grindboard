'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playTimerStart, playTimerEnd } from '@/lib/utils/pomodoroSounds';

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

const defaultSettings: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
};

interface UsePomodoroReturn {
  mode: PomodoroMode;
  setMode: (mode: PomodoroMode) => void;
  timeLeft: number;
  isRunning: boolean;
  sessionsCompleted: number;
  settings: PomodoroSettings;
  start: () => void;
  pause: () => void;
  reset: () => void;
  updateSettings: (s: Partial<PomodoroSettings>) => void;
}

export function usePomodoro(onSessionComplete?: (durationMinutes: number) => void): UsePomodoroReturn {
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoroSettings');
      return saved ? JSON.parse(saved) : defaultSettings;
    }
    return defaultSettings;
  });

  const [mode, setModeState] = useState<PomodoroMode>('work');
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const getDuration = useCallback((m: PomodoroMode) => {
    switch (m) {
      case 'work': return settings.workDuration * 60;
      case 'shortBreak': return settings.shortBreakDuration * 60;
      case 'longBreak': return settings.longBreakDuration * 60;
    }
  }, [settings]);

  const setMode = useCallback((m: PomodoroMode) => {
    setModeState(m);
    setIsRunning(false);
    setTimeLeft(getDuration(m));
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [getDuration]);


  const start = useCallback(() => {
    startTimeRef.current = new Date();
    setIsRunning(true);
    playTimerStart();
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeLeft(getDuration(mode));
  }, [getDuration, mode]);

  const updateSettings = useCallback((s: Partial<PomodoroSettings>) => {
    const newSettings = { ...settings, ...s };
    setSettings(newSettings);
    localStorage.setItem('pomodoroSettings', JSON.stringify(newSettings));
    setTimeLeft(getDuration(mode));
    setIsRunning(false);
  }, [settings, mode, getDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            playTimerEnd();

            if (mode === 'work' && onSessionComplete && startTimeRef.current) {
              const elapsed = Math.round((Date.now() - startTimeRef.current.getTime()) / 60000);
              onSessionComplete(elapsed);
            }

            if (mode === 'work') {
              setSessionsCompleted((c) => c + 1);
            }

            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, mode, onSessionComplete]);

  // Update timeLeft when mode changes via settings
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDuration(mode));
    }
  }, [settings, mode, getDuration, isRunning]);

  return {
    mode,
    setMode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    settings,
    start,
    pause,
    reset,
    updateSettings,
  };
}
