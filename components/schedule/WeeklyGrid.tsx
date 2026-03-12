'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import type { Schedule, Subject } from '@/types/database';

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07:00 – 22:00
const ROW_H = 60; // px per hour
const START_HOUR = 7;

interface WeeklyGridProps {
  schedules: (Schedule & { subject: Subject })[];
  onDelete: (id: string) => void;
  today: number;
}

export function WeeklyGrid({ schedules, onDelete, today }: WeeklyGridProps) {
  const t = useTranslations('schedule');
  const [nowMins, setNowMins] = useState<number | null>(null);

  const DAY_ABBR: Record<number, string> = {
    0: t('daysShort.sun' as never), 1: t('daysShort.mon' as never), 2: t('daysShort.tue' as never),
    3: t('daysShort.wed' as never), 4: t('daysShort.thu' as never), 5: t('daysShort.fri' as never),
    6: t('daysShort.sat' as never),
  };

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNowMins(d.getHours() * 60 + d.getMinutes());
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const orderedDays = [1, 2, 3, 4, 5, 6, 0];

  const getBlocks = (day: number) => schedules.filter((s) => s.day_of_week === day);

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const nowTop = nowMins !== null ? ((nowMins - START_HOUR * 60) / 60) * ROW_H : null;
  const nowInRange = nowTop !== null && nowTop >= 0 && nowTop <= HOURS.length * ROW_H;

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07] bg-card/40 backdrop-blur-sm shadow-xl">
      <div className="min-w-[720px]">

        {/* ── Header ── */}
        <div className="grid grid-cols-8 border-b border-white/[0.06] bg-white/[0.015]">
          <div className="py-5 px-3" />
          {orderedDays.map((dayIdx) => {
            const isToday = dayIdx === today;
            return (
              <div key={dayIdx} className="py-5 flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    'text-[11px] font-bold uppercase tracking-[0.12em]',
                    isToday ? 'text-amber-400' : 'text-muted-foreground/50',
                  )}
                >
                  {DAY_ABBR[dayIdx]}
                </span>
                {isToday && (
                  <span className="text-[9px] font-semibold text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                    {t('today')}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Grid body ── */}
        <div className="grid grid-cols-8 relative" style={{ height: `${HOURS.length * ROW_H}px` }}>

          {/* Time column */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute w-full flex items-start justify-end pr-4 pt-1.5"
                style={{ top: `${(hour - START_HOUR) * ROW_H}px`, height: `${ROW_H}px` }}
              >
                <span className="text-[11px] text-muted-foreground/35 tabular-nums font-medium">
                  {hour}:00
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {orderedDays.map((dayIdx) => {
            const isToday = dayIdx === today;
            const dayBlocks = getBlocks(dayIdx);

            return (
              <div
                key={dayIdx}
                className={cn(
                  'relative border-l border-white/[0.05]',
                  isToday && 'bg-amber-400/[0.025]',
                )}
              >
                {/* Hour lines */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-t border-white/[0.04]"
                    style={{ top: `${(hour - START_HOUR) * ROW_H}px` }}
                  />
                ))}

                {/* Half-hour lines */}
                {HOURS.map((hour) => (
                  <div
                    key={`${hour}-half`}
                    className="absolute w-full border-t border-dashed border-white/[0.02]"
                    style={{ top: `${(hour - START_HOUR) * ROW_H + ROW_H / 2}px` }}
                  />
                ))}

                {/* Current time indicator */}
                {isToday && nowInRange && nowTop !== null && (
                  <div
                    className="absolute left-0 right-0 z-20 pointer-events-none"
                    style={{ top: `${nowTop}px` }}
                  >
                    <div className="flex items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 -ml-1.5 shrink-0 shadow-[0_0_8px_2px_rgba(245,158,11,0.6)]" />
                      <div className="flex-1 h-px bg-gradient-to-r from-amber-400/70 to-amber-400/10" />
                    </div>
                  </div>
                )}

                {/* Schedule blocks */}
                {dayBlocks.map((block) => {
                  const startMins = toMins(block.start_time);
                  const endMins = toMins(block.end_time);
                  const top = ((startMins - START_HOUR * 60) / 60) * ROW_H;
                  const height = ((endMins - startMins) / 60) * ROW_H;
                  const col = block.subject.color;

                  return (
                    <div
                      key={block.id}
                      className="absolute inset-x-1.5 rounded-xl overflow-hidden group transition-all duration-200 hover:inset-x-0.5 hover:z-10 hover:shadow-lg"
                      style={{
                        top: `${top + 2}px`,
                        height: `${Math.max(height - 4, 26)}px`,
                        backgroundColor: col + '1a',
                        borderLeft: `3px solid ${col}`,
                        boxShadow: `0 0 0 0 ${col}00`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 20px ${col}20`;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 0 0 ${col}00`;
                      }}
                    >
                      <div className="h-full px-2 py-1.5">
                        <p
                          className="text-[11px] font-bold leading-tight truncate"
                          style={{ color: col }}
                        >
                          {block.subject.name}
                        </p>
                        {height >= 36 && (
                          <p className="text-[9px] text-muted-foreground/50 mt-0.5 tabular-nums">
                            {block.start_time.slice(0, 5)}–{block.end_time.slice(0, 5)}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => onDelete(block.id)}
                        className="absolute top-1 right-1 h-5 w-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/40 hover:bg-red-500/80"
                      >
                        <Trash2 className="h-2.5 w-2.5 text-white" />
                      </button>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
