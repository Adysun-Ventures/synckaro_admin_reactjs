'use client';

import { useEffect } from 'react';
import { loadSeedData } from '@/lib/loadSeedData';

/**
 * Seed Data Provider
 * Initializes dummy data in localStorage on app mount
 */
export function SeedDataProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    loadSeedData();
  }, []);

  return <>{children}</>;
}

