import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import type { Locale } from '@/i18n/config';

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'terms' });
  const sections = t.raw('sections') as { title: string; content: string }[];

  return (
    <div className="min-h-screen bg-background">
      <Navbar locale={locale} />
      <main className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t('title')}</h1>
        <p className="text-xs text-muted-foreground mb-10">{t('lastUpdated')}</p>
        <p className="text-sm text-muted-foreground leading-relaxed mb-10">{t('intro')}</p>
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-base font-bold mb-2">{section.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
