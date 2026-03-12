'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Subject } from '@/types/database';

interface SubjectSelectorProps {
  subjects: Subject[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  className?: string;
}

export function SubjectSelector({ subjects, selectedId, onSelect, className }: SubjectSelectorProps) {
  const t = useTranslations('pomodoro');

  return (
    <Select
      value={selectedId || 'none'}
      onValueChange={(v) => onSelect(v === 'none' ? null : v)}
    >
      <SelectTrigger className={cn('w-full', className)}>
        <SelectValue placeholder={t('selectSubject')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">{t('noSubject')}</SelectItem>
        {subjects.map((subject) => (
          <SelectItem key={subject.id} value={subject.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: subject.color }}
              />
              {subject.name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
