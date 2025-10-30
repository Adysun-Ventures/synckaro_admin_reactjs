'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { storage } from '@/lib/storage';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'teacher' | 'student')[];
}

/**
 * Protected Route Component
 * Handles authentication and role-based access control
 */
export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const auth = storage.getAuth();

    // Check if user is authenticated
    if (!auth?.isAuthenticated) {
      // Redirect to login with return URL
      const redirectUrl = encodeURIComponent(pathname);
      router.push(`/login?redirect=${redirectUrl}`);
      return;
    }

    // Check role-based access if roles are specified
    if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
      router.push('/unauthorized');
      return;
    }
  }, [pathname, router, allowedRoles]);

  // Check authentication status before rendering
  const auth = storage.getAuth();

  if (!auth?.isAuthenticated) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return null;
  }

  return <>{children}</>;
}

