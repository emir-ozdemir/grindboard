'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Moon, Sun, LogOut, Settings, ChevronDown } from 'lucide-react';
import type { Profile } from '@/types/database';

interface HeaderProps {
  profile?: Profile | null;
}

const navKeys: Record<string, string> = {
  dashboard: 'nav.dashboard',
  pomodoro: 'nav.pomodoro',
  schedule: 'nav.schedule',
  topics: 'nav.topics',
  notes: 'nav.notes',
  stats: 'nav.stats',
  exams: 'nav.exams',
  settings: 'nav.settings',
};

export function Header({ profile }: HeaderProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = params.locale as string;
  const { theme, setTheme } = useTheme();
  const supabase = createClient();

  // Detect current page for breadcrumb
  const segment = Object.keys(navKeys).find((k) =>
    pathname.includes(`/${k}`)
  );
  const pageTitle = segment ? t(navKeys[segment]) : t('nav.dashboard');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push(`/${locale}/login`);
    router.refresh();
  };

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'GB';

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between px-6 h-14 border-b border-border/40 bg-background/95 backdrop-blur-sm">
      {/* Page title */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-foreground">{pageTitle}</h2>
      </div>

      <div className="flex items-center gap-1">
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <div className="w-px h-4 bg-border/60 mx-1" />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-accent"
            >
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] font-semibold bg-primary/15 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {profile?.full_name && (
                <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                  {profile.full_name.split(' ')[0]}
                </span>
              )}
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {profile?.full_name && (
              <>
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate">{profile.full_name}</p>
                  {profile.username && (
                    <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                  )}
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push(`/${locale}/settings`)}
            >
              <Settings className="mr-2 h-4 w-4" />
              {t('common.settings')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
