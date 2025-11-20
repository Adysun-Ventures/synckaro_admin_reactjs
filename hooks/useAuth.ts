import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import { AuthData } from '@/types';

/**
 * useAuth Hook
 * 
 * Provides consistent authentication state and user_id access across the app.
 * Syncs with localStorage and listens to storage events for cross-tab sync.
 * 
 * @returns { user, isAuthenticated, token, userId, isLoading }
 */
export function useAuth() {
  const [authData, setAuthData] = useState<AuthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth data from localStorage
  const loadAuth = () => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const auth = storage.getAuth();
    setAuthData(auth);
    setIsLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadAuth();
  }, []);

  // Listen to storage events for cross-tab sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      // Check if auth storage changed
      if (e.key === 'synckaro_admin_auth' || e.key === null) {
        loadAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also listen to custom storage events (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadAuth();
    };

    // Listen to custom event that can be dispatched when auth changes
    window.addEventListener('auth-changed', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-changed', handleCustomStorageChange);
    };
  }, []);

  // Compute derived values
  const user = authData?.user || null;
  const isAuthenticated = authData?.isAuthenticated || false;
  const token = authData?.token || null;
  
  // Convert user.id (string) to number for API calls
  const userId: number | null = user?.id ? parseInt(user.id, 10) : null;
  
  // Validate userId conversion
  const validUserId = userId !== null && !isNaN(userId) ? userId : null;

  return {
    user,
    isAuthenticated,
    userId: validUserId,
    token,
    isLoading,
  };
}

