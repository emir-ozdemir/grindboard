import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { SocialProof } from '@/components/landing/SocialProof';
import { Features } from '@/components/landing/Features';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { FAQ } from '@/components/landing/FAQ';
import { BottomCTA } from '@/components/landing/BottomCTA';
import { Footer } from '@/components/landing/Footer';
import type { Locale } from '@/i18n/config';

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-background">
      <Navbar locale={locale} />
      <Hero locale={locale} />
      <SocialProof />
      <Features />
      <HowItWorks />
      <Pricing locale={locale} />
      <FAQ />
      <BottomCTA locale={locale} />
      <Footer />
    </div>
  );
}
