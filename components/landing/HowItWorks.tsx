'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const steps = ['step1', 'step2', 'step3'] as const;

export function HowItWorks() {
  const t = useTranslations('landing.howItWorks');

  return (
    <section id="how-it-works" className="py-24 px-4 bg-muted/15">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {t('title')}
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg max-w-lg mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="relative">
          {/* Connector line — sits at the vertical center of the circles (top-10 = 40px = half of h-20) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+2.5rem)] right-[calc(16.67%+2.5rem)] h-px bg-border/60" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <motion.div
                key={step}
                className="flex flex-col items-center text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.12 }}
              >
                <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-card border-2 border-primary/30 mb-6 z-10 shadow-sm">
                  <span className="text-2xl font-bold text-primary">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold mb-3">{t(`${step}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
                  {t(`${step}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
