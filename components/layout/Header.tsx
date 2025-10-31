'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { storage } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
}

export function Header({ title = 'Dashboard' }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  const auth = storage.getAuth();
  const userName = auth?.user?.name || 'Admin';

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

  const handleLogout = () => {
    storage.clearAuth();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 right-0 left-64 z-40 h-16 border-b border-neutral-200 bg-white">
      <div className="flex h-full items-center justify-end px-6">
        {/* User Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <span className="text-neutral-700 font-medium">{userName}</span>
            <UserCircleIcon className="h-8 w-8 text-neutral-400" />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-1">
                <button
                  onClick={() => {
                    router.push('/profile');
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <UserCircleIcon className="mr-3 h-5 w-5 text-neutral-400" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    router.push('/settings');
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  <Cog6ToothIcon className="mr-3 h-5 w-5 text-neutral-400" />
                  Settings
                </button>
                <div className="border-t border-neutral-200"></div>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-danger-700 hover:bg-danger-50 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

