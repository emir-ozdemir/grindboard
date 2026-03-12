'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { playTimerStart, playTimerEnd } from '@/lib/utils/pomodoroSounds';

export interface FlowBlock {
  id: string;
  type: 'work' | 'break';
  duration: number; // minutes
  subjectId?: string | null;
}

const STORAGE_KEY = 'pomodoroFlowBlocks';

function getDefaultBlocks(): FlowBlock[] {
  return [
    { id: 'f1', type: 'work', duration: 40 },
    { id: 'f2', type: 'break', duration: 10 },
    { id: 'f3', type: 'work', duration: 40 },
    { id: 'f4', type: 'break', duration: 20 },
  ];
}

function loadBlocks(): FlowBlock[] {
  if (typeof window === 'undefined') return getDefaultBlocks();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultBlocks();
  } catch {
    return getDefaultBlocks();
  }
}

function saveBlocks(b: FlowBlock[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
}

export function usePomodoroFlow(
  onWorkBlockComplete?: (block: FlowBlock, durationMinutes: number) => void,
) {
  const [blocks, setBlocksRaw] = useState<FlowBlock[]>(loadBlocks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(() => {
    const b = loadBlocks();
    return (b[0]?.duration ?? 25) * 60;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const blocksRef = useRef(blocks);
  const currentIndexRef = useRef(currentIndex);
  const onCompleteRef = useRef(onWorkBlockComplete);

  useEffect(() => { blocksRef.current = blocks; }, [blocks]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { onCompleteRef.current = onWorkBlockComplete; }, [onWorkBlockComplete]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;

          const completedBlock = blocksRef.current[currentIndexRef.current];
          playTimerEnd();
          setIsRunning(false);

          if (completedBlock?.type === 'work' && onCompleteRef.current && startTimeRef.current) {
            const elapsed = Math.round((Date.now() - startTimeRef.current.getTime()) / 60000);
            onCompleteRef.current(completedBlock, elapsed);
          }

          const isLast = currentIndexRef.current >= blocksRef.current.length - 1;
          if (isLast) {
            setIsComplete(true);
          } else {
            setIsTransitioning(true);
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };
  }, [isRunning]);

  // Auto-advance to next block after brief pause
  useEffect(() => {
    if (!isTransitioning) return;
    const t = setTimeout(() => {
      const nextIdx = currentIndexRef.current + 1;
      const nextBlock = blocksRef.current[nextIdx];
      if (nextBlock) {
        setCurrentIndex(nextIdx);
        setTimeLeft(nextBlock.duration * 60);
        startTimeRef.current = new Date();
        setIsRunning(true);
        setIsTransitioning(false);
        playTimerStart();
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [isTransitioning]);

  const setBlocks = useCallback((newBlocks: FlowBlock[]) => {
    setBlocksRaw(newBlocks);
    saveBlocks(newBlocks);
  }, []);

  const addBlock = useCallback((partial: Omit<FlowBlock, 'id'>) => {
    setBlocksRaw(prev => {
      const updated = [...prev, { ...partial, id: `f-${Date.now()}` }];
      saveBlocks(updated);
      return updated;
    });
  }, []);

  const removeBlock = useCallback((id: string) => {
    setBlocksRaw(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveBlocks(updated);
      return updated;
    });
  }, []);

  const updateBlock = useCallback((id: string, patch: Partial<Omit<FlowBlock, 'id'>>) => {
    setBlocksRaw(prev => {
      const updated = prev.map(b => b.id === id ? { ...b, ...patch } : b);
      saveBlocks(updated);
      return updated;
    });
  }, []);

  const start = useCallback(() => {
    if (blocksRef.current.length === 0) return;
    startTimeRef.current = new Date();
    setHasStarted(true);
    setIsComplete(false);
    setIsRunning(true);
    playTimerStart();
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsTransitioning(false);
    setHasStarted(false);
    setIsComplete(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setCurrentIndex(0);
    setTimeLeft((blocksRef.current[0]?.duration ?? 25) * 60);
  }, []);

  const currentBlock = blocks[currentIndex] ?? blocks[0];
  const totalDuration = blocks.reduce((sum, b) => sum + b.duration, 0);

  return {
    blocks,
    setBlocks,
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
  };
}
