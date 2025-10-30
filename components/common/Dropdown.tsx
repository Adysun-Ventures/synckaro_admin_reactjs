'use client';

import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  danger?: boolean;
}

interface DropdownProps {
  items: DropdownMenuItem[];
  className?: string;
}

export function Dropdown({ items, className }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className={cn('relative inline-block text-left', className)}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center rounded-full p-2 text-neutral-400 hover:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors"
          aria-label="Open options"
        >
          <EllipsisVerticalIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center px-4 py-2 text-sm transition-colors',
                  item.danger
                    ? 'text-danger-700 hover:bg-danger-50'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
              >
                {item.icon && <span className="mr-3 h-5 w-5">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

