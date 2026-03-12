'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Settings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}

interface PomodoroSettingsProps {
  settings: Settings;
  onUpdate: (s: Partial<Settings>) => void;
}

export function PomodoroSettings({ settings, onUpdate }: PomodoroSettingsProps) {
  const t = useTranslations('pomodoro.settings');

  return (
    <Card className="w-full border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">{t('workDuration')}</Label>
            <Input
              type="number"
              min={1}
              max={90}
              value={settings.workDuration}
              onChange={(e) => onUpdate({ workDuration: Number(e.target.value) })}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('shortBreakDuration')}</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={settings.shortBreakDuration}
              onChange={(e) => onUpdate({ shortBreakDuration: Number(e.target.value) })}
              className="h-8"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">{t('longBreakDuration')}</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={settings.longBreakDuration}
              onChange={(e) => onUpdate({ longBreakDuration: Number(e.target.value) })}
              className="h-8"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
