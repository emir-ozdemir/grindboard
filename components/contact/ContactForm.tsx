'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-4 py-14 text-center"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold">{t('successTitle')}</h3>
          <p className="text-sm text-muted-foreground max-w-xs">{t('successDesc')}</p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{t('name')}</label>
              <input
                type="text"
                name="name"
                required
                placeholder={t('namePlaceholder')}
                value={form.name}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">{t('emailField')}</label>
              <input
                type="email"
                name="email"
                required
                placeholder={t('emailPlaceholder')}
                value={form.email}
                onChange={handleChange}
                className="px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">{t('subject')}</label>
            <input
              type="text"
              name="subject"
              required
              placeholder={t('subjectPlaceholder')}
              value={form.subject}
              onChange={handleChange}
              className="px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground">{t('message')}</label>
            <textarea
              name="message"
              required
              rows={5}
              placeholder={t('messagePlaceholder')}
              value={form.message}
              onChange={handleChange}
              className="px-3.5 py-2.5 rounded-xl border border-border/60 bg-background text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl btn-gradient text-white text-sm font-bold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-transform"
          >
            {t('submit')}
            <Send className="w-4 h-4" />
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
