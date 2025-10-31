import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  gradient?: boolean;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  hover?: boolean;
  border?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  className,
  gradient = false,
  gradientFrom = 'from-blue-600',
  gradientVia = 'via-blue-700',
  gradientTo = 'to-blue-800',
  hover = false,
  border = true,
  padding = 'md',
}: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        'rounded-xl',
        gradient
          ? `bg-gradient-to-r ${gradientFrom} ${gradientVia} ${gradientTo}`
          : 'bg-white',
        border && !gradient && 'border border-neutral-200',
        hover && 'hover:shadow-md transition-shadow',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

