'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface NavbarProps {
  locale: string;
}

export function Navbar({ locale }: NavbarProps) {
  const t = useTranslations('landing.nav');
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: '#features', label: t('features') },
    { href: '#pricing', label: t('pricing') },
    { href: '#faq', label: t('faq') },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2 font-bold text-lg">
          <div className="flex items-center justify-center w-7 h-7 bg-primary rounded-md">
            <BookOpen className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          GrindBoard
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/login`}>{t('login')}</Link>
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link href={`/${locale}/register`}>{t('cta')}</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background px-4 py-4 space-y-3">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="block text-sm text-muted-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" asChild className="flex-1">
              <Link href={`/${locale}/login`}>{t('login')}</Link>
            </Button>
            <Button size="sm" asChild className="flex-1">
              <Link href={`/${locale}/register`}>{t('cta')}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
