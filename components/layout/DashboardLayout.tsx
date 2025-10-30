'use client';

import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBlocker } from './MobileBlocker';

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <>
      <MobileBlocker />
      <div className="hidden md:flex min-h-screen bg-neutral-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <Header title={title} />
          <main className="mt-16 p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

