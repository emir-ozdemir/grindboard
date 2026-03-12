'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { differenceInDays } from 'date-fns';
import type { Subscription } from '@/types/database';

interface TrialBannerProps {
  subscription: Subscription | null;
}

export function TrialBanner({ subscription }: TrialBannerProps) {
  const t = useTranslations('dashboard');
  const params = useParams();
  const locale = params.locale as string;
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !subscription) return null;

  const isTrialing = subscription.status === 'trialing';
  const isExpired = subscription.status === 'expired';

  if (!isTrialing && !isExpired) return null;

  const daysLeft = subscription.trial_ends_at
    ? Math.max(0, differenceInDays(new Date(subscription.trial_ends_at), new Date()))
    : 0;

  if (isExpired || daysLeft <= 0) {
    return (
      <div className="flex items-center justify-between p-4 mb-6 bg-destructive/10 border border-destructive/30 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <span className="text-sm font-medium">{t('trialExpired')}</span>
        </div>
        <Button asChild size="sm" variant="destructive">
          <Link href={`/${locale}/subscribe`}>{t('subscribeNow')}</Link>
        </Button>
      </div>
    );
  }

  if (daysLeft <= 3) {
    return (
      <div className="flex items-center justify-between p-4 mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">
            {t('trialBanner', { days: daysLeft })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href={`/${locale}/subscribe`}>{t('subscribeNow')}</Link>
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(true)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
