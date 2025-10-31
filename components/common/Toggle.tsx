import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  className?: string;
  label?: string;
}

export function Toggle({ enabled, onChange, className, label }: ToggleProps) {
  return (
    <div className={cn('flex items-center', className)}>
      {label && (
        <span className="mr-3 text-sm font-medium text-neutral-700">{label}</span>
      )}
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
          enabled ? 'bg-primary-600' : 'bg-neutral-200'
        )}
        role="switch"
        aria-checked={enabled}
        aria-label={label || 'Toggle'}
      >
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out',
            enabled ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

