import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error';
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusStyles = {
    active: 'bg-success-100 text-success-700 border-success-200',
    inactive: 'bg-neutral-100 text-neutral-700 border-neutral-200',
    pending: 'bg-warning-100 text-warning-700 border-warning-200',
    error: 'bg-danger-100 text-danger-700 border-danger-200',
  };
  
  const statusLabels = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending',
    error: 'Error',
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

