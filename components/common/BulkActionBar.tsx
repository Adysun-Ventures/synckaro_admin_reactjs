import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  actions,
  className,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;
  
  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-200 bg-white shadow-lg transition-transform',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onClear}
              className="flex items-center justify-center rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 transition-colors"
              aria-label="Clear selection"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-neutral-700">
              {selectedCount} selected
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'primary'}
                size="sm"
                onClick={action.onClick}
                icon={action.icon}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

