import React from 'react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {icon && (
        <div className="mx-auto h-12 w-12 text-neutral-400">
          {icon}
        </div>
      )}
      <h3 className="mt-4 text-sm font-medium text-neutral-700">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-neutral-500">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}

