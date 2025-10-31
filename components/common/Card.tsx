import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  hover?: boolean;
  border?: boolean;
  padding?: CardPadding;
  glass?: boolean;
  tone?: 'neutral' | 'success' | 'danger' | 'warning' | 'primary';
  header?: ReactNode;
  footer?: ReactNode;
  bleed?: boolean;
}

const paddingClasses: Record<CardPadding, string> = {
  none: '',
  xs: 'p-3',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const toneClasses: Record<NonNullable<CardProps['tone']>, string> = {
  neutral: 'border-neutral-200/80 bg-white/80',
  success: 'border-success-200/70 bg-success-25',
  danger: 'border-danger-200/70 bg-danger-25',
  warning: 'border-warning-200/70 bg-warning-25',
  primary: 'border-primary-200/70 bg-primary-25',
};

export function Card({
  children,
  className,
  gradient = false,
  gradientFrom = 'from-blue-600/90',
  gradientVia = 'via-slate-900/80',
  gradientTo = 'to-neutral-900/80',
  hover = false,
  border = true,
  padding = 'md',
  glass = false,
  tone = 'neutral',
  header,
  footer,
  bleed = false,
}: CardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl transition-shadow duration-200',
        gradient
          ? `bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`
          : glass
            ? 'border border-white/10 bg-white/5 backdrop-blur-lg'
            : [border ? `border ${toneClasses[tone]}` : 'bg-white/90', 'shadow-sm'],
        hover && 'hover:shadow-lg hover:shadow-black/5',
        bleed ? 'p-0' : paddingClasses[padding],
        className
      )}
    >
      {gradient && <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" aria-hidden="true" />}

      <div className={cn('relative flex flex-col gap-4', bleed ? paddingClasses[padding] : '')}>
        {header && (
          <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-neutral-700/90 [&>*:last-child]:ml-auto">
            {header}
          </div>
        )}
        <div className="flex-1">{children}</div>
        {footer && <div className="pt-3 text-sm text-neutral-500/90">{footer}</div>}
      </div>

      {!bleed && glass && <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/20" />}
    </div>
  );
}

