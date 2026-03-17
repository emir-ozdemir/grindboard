'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import { Sun, Moon, Monitor, Trash2 } from 'lucide-react';
import type { Profile } from '@/types/database';

// ─── Keyboard Shortcuts Widget ─────────────────────────────────────────────────

function KeyboardShortcutsWidget() {
  const t = useTranslations('settings');
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(/mac/i.test(navigator.userAgent) && !/iphone|ipad/i.test(navigator.userAgent));
  }, []);

  const mod = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { keys: ['Space'],      label: t('shortcutPomodoroToggle'), pomodoroOnly: true },
    { keys: ['R'],          label: t('shortcutPomodoroReset'),  pomodoroOnly: true },
    { keys: [mod, 'D'],     label: t('shortcutToggleTheme'),    pomodoroOnly: false },
    { keys: ['1 – 5'],      label: t('shortcutNavPages'),       pomodoroOnly: false },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-card/60 backdrop-blur-sm overflow-hidden">
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {t('shortcuts')}
        </p>

        <div className="space-y-2.5">
          {shortcuts.map(({ keys, label, pomodoroOnly }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm text-muted-foreground truncate">{label}</span>
                {pomodoroOnly && (
                  <span className="text-[9px] text-muted-foreground/50 bg-white/5 border border-white/[0.07] px-1.5 py-0.5 rounded-full shrink-0">
                    Pomodoro
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {keys.map((key, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <kbd className="inline-flex items-center justify-center min-w-[26px] h-[22px] px-1.5 font-mono text-[11px] font-semibold bg-white/5 border border-white/[0.12] rounded-md text-muted-foreground shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]">
                      {key}
                    </kbd>
                    {i < keys.length - 1 && (
                      <span className="text-[10px] text-muted-foreground/40">+</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/50 border-t border-white/[0.06] pt-3 leading-relaxed">
          {t('shortcutsNote')}
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const t = useTranslations('settings');
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [dailyGoal, setDailyGoal] = useState(120);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();

    if (prof) {
      setProfile(prof);
      setFullName(prof.full_name || '');
      setUsername(prof.username || '');
      setDailyGoal(prof.daily_goal_minutes);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: fullName,
      username: username,
      daily_goal_minutes: dailyGoal,
      preferred_locale: locale,
    }).eq('id', profile.id);
    setSaving(false);
    toast({ title: t('savedSuccessfully') });
  };

  const handleDeleteAccount = async () => {
    if (!confirm(t('deleteWarning'))) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').delete().eq('id', user.id);
    await supabase.auth.signOut();
    router.push(`/${locale}`);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-5 items-start">

      {/* ── Left: settings forms ── */}
      <div className="space-y-3">

        {/* Profile */}
        <Card className="border-border/50">
          <CardHeader className="px-5 pt-5 pb-3">
            <CardTitle className="text-sm font-semibold">{t('profile')}</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('fullName')}</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t('username')}</Label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="h-9" />
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">{t('dailyGoal')}</Label>
                <Input
                  type="number"
                  min={30}
                  max={480}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-28 h-9"
                />
              </div>
              <Button size="sm" onClick={saveProfile} disabled={saving} className="h-9">
                {t('saveChanges')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Theme + Language — side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-border/50">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">{t('theme')}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex flex-col gap-1.5">
                {[
                  { value: 'light',  label: t('lightMode'),  icon: Sun },
                  { value: 'dark',   label: t('darkMode'),   icon: Moon },
                  { value: 'system', label: t('systemMode'), icon: Monitor },
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => setTheme(value)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left',
                      theme === value
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm font-semibold">{t('language')}</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <Select
                value={locale}
                onValueChange={(newLocale) => {
                  const newPath = window.location.pathname.replace(`/${locale}`, `/${newLocale}`);
                  router.push(newPath);
                }}
              >
                <SelectTrigger className="w-full h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">TR — Türkçe</SelectItem>
                  <SelectItem value="en">EN — English</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">{t('deleteAccount')}</CardTitle>
            <CardDescription>{t('deleteWarning')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" size="sm" onClick={handleDeleteAccount} className="gap-2">
              <Trash2 className="h-4 w-4" />
              {t('deleteAccount')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Right: sticky widgets (desktop only) ── */}
      <div className="hidden xl:flex flex-col gap-4 sticky top-6">
        <KeyboardShortcutsWidget />
      </div>
    </div>
  );
}
