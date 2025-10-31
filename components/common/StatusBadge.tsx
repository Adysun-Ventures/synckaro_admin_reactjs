import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'open' | 'close' | 'live' | 'test';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles = {
    active: 'bg-success-100 text-success-800 border-success-200',
    inactive: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    pending: 'bg-warning-100 text-warning-800 border-warning-200',
    error: 'bg-danger-100 text-danger-800 border-danger-200',
    open: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    close: 'bg-rose-100 text-rose-800 border-rose-200',
    live: 'bg-lime-100 text-lime-800 border-lime-200',
    test: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  
  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    error: 'Error',
    open: 'Open',
    close: 'Closed',
    live: 'Live',
    test: 'Test',
  };
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

