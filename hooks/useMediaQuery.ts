'use client';

import { useState, useEffect } from 'react';

/**
 * Custom hook for media query detection
 * @param query - Media query string (e.g., '(min-width: 768px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
  // Lazy state initialization - check media query immediately on client-side
  // This prevents flash by getting correct value on first render
  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    // Default to false for SSR (safe default)
    return false;
  });

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return;

    const media = window.matchMedia(query);
    
    // Update if value changed between initial render and effect (edge case)
    setMatches(media.matches);

    // Create event listener for future changes
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener (modern browsers)
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

