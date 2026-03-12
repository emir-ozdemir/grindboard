import { getTranslations } from 'next-intl/server';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ContactForm } from '@/components/contact/ContactForm';
import { Mail, Clock } from 'lucide-react';
import type { Locale } from '@/i18n/config';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });

  return (
    <div className="min-h-screen bg-background">
      <Navbar locale={locale} />
      <main className="max-w-3xl mx-auto px-4 py-20">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">{t('title')}</h1>
        <p className="text-xs text-muted-foreground mb-10">{t('lastUpdated')}</p>

        {/* Direct contact info */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className="flex items-center gap-3 flex-1 rounded-xl border border-border/60 bg-card px-4 py-3.5">
            <Mail className="w-4 h-4 text-primary shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-0.5">{t('emailLabel')}</p>
              <a href={`mailto:${t('email')}`} className="text-sm font-semibold hover:text-primary transition-colors">
                {t('email')}
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1 rounded-xl border border-border/60 bg-card px-4 py-3.5">
            <Clock className="w-4 h-4 text-primary shrink-0" />
            <p className="text-sm text-muted-foreground">{t('responseTime')}</p>
          </div>
        </div>

        {/* Contact form */}
        <div className="rounded-2xl border border-border/60 bg-card p-6 md:p-8">
          <h2 className="text-base font-bold mb-6">{t('formTitle')}</h2>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </div>
  );
}
