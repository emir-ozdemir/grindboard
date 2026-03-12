'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { locales } from '@/i18n/config';

const labels: Record<string, string> = {
  tr: 'TR',
  en: 'EN',
};

export function LanguageSwitcher() {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = params.locale as string;

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-0.5">
      {locales.map((locale) => (
        <Button
          key={locale}
          variant="ghost"
          size="sm"
          className={
            locale === currentLocale
              ? 'h-7 px-2 text-xs font-semibold text-foreground bg-accent'
              : 'h-7 px-2 text-xs font-medium text-muted-foreground hover:text-foreground'
          }
          onClick={() => switchLocale(locale)}
          title={locale === 'tr' ? 'Türkçe' : 'English'}
        >
          {labels[locale]}
        </Button>
      ))}
    </div>
  );
}
