'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const stats = [
  { value: '1.200+', key: 'students' },
  { value: '95.000+', key: 'pomodoros' },
  { value: '48.000+', key: 'topics' },
  { value: '4.9 / 5', key: 'rating' },
];

export function SocialProof() {
  const t = useTranslations('landing.socialProof');

  return (
    <section className="py-16 px-4 border-y border-border/50 bg-muted/10">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.key}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{t(stat.key)}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
