import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

const colorMap = {
  violet: {
    bg: 'bg-violet-500/8',
    border: 'border-violet-500/20',
    icon: 'bg-violet-500/15 text-violet-500',
    value: 'text-violet-500',
    glow: 'bg-violet-500/10',
  },
  blue: {
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/20',
    icon: 'bg-blue-500/15 text-blue-500',
    value: 'text-blue-500',
    glow: 'bg-blue-500/10',
  },
  amber: {
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/20',
    icon: 'bg-amber-500/15 text-amber-500',
    value: 'text-amber-500',
    glow: 'bg-amber-500/10',
  },
  emerald: {
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/20',
    icon: 'bg-emerald-500/15 text-emerald-500',
    value: 'text-emerald-500',
    glow: 'bg-emerald-500/10',
  },
  default: {
    bg: 'bg-primary/5',
    border: 'border-border/50',
    icon: 'bg-primary/10 text-primary',
    value: 'text-foreground',
    glow: 'bg-primary/8',
  },
} as const;

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: keyof typeof colorMap;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'default',
  className,
}: SummaryCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={cn(
        'relative rounded-2xl border p-5 overflow-hidden card-hover',
        c.bg,
        c.border,
        className
      )}
    >
      {/* Corner glow */}
      <div
        className={cn(
          'absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-60',
          c.glow
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {title}
          </p>
          <div className={cn('p-1.5 rounded-lg', c.icon)}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>

        <div className={cn('text-2xl font-bold tracking-tight leading-none', c.value)}>
          {value}
        </div>

        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
