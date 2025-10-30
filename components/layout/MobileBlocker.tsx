'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ComputerDesktopIcon } from '@heroicons/react/24/outline';

export function MobileBlocker() {
  const isTabletOrLarger = useMediaQuery('(min-width: 768px)');

  if (isTabletOrLarger) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
          <ComputerDesktopIcon className="h-8 w-8 text-neutral-600" />
        </div>
        <h2 className="mb-3 text-2xl font-semibold text-neutral-900">
          Desktop Required
        </h2>
        <p className="mb-6 text-neutral-600">
          The SyncKaro Admin dashboard is designed for desktop and tablet devices to provide the best experience for managing your trading platform.
        </p>
        <div className="rounded-lg bg-neutral-50 p-4 text-left">
          <p className="mb-2 text-sm font-medium text-neutral-700">
            Please access this dashboard from:
          </p>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>• Desktop computer (recommended)</li>
            <li>• Tablet device (landscape mode)</li>
            <li>• Screen width of 768px or larger</li>
          </ul>
        </div>
        <p className="mt-6 text-xs text-neutral-500">
          Need help? Contact support at support@synckaro.com
        </p>
      </div>
    </div>
  );
}

