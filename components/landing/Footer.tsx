'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { BookOpen } from 'lucide-react';

export function Footer() {
  const t = useTranslations('landing.footer');
  const params = useParams();
  const locale = params.locale as string ?? 'tr';

  return (
    <footer className="border-t border-border/50 py-10 px-4 bg-muted/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-1.5">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 bg-primary rounded-md">
              <BookOpen className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-bold">GrindBoard</span>
          </div>
          <p className="text-xs text-muted-foreground">{t('slogan')}</p>
        </div>

        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          <Link href={`/${locale}/privacy`} className="hover:text-foreground transition-colors">
            {t('links.privacy')}
          </Link>
          <Link href={`/${locale}/terms`} className="hover:text-foreground transition-colors">
            {t('links.terms')}
          </Link>
          <Link href={`/${locale}/contact`} className="hover:text-foreground transition-colors">
            {t('links.contact')}
          </Link>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} GrindBoard. {t('rights')}
        </p>
      </div>
    </footer>
  );
}
