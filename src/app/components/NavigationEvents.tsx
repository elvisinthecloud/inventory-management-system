'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useLoading } from '../context/LoadingContext';

export function NavigationEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { stopLoading } = useLoading();

  useEffect(() => {
    console.log(`NavigationEvents: Route changed to ${pathname}${searchParams}`);
    // When the path or search params change, indicating navigation has likely completed,
    // schedule the loading indicator to stop after a delay.
    
    const timer = setTimeout(() => {
      console.log('NavigationEvents: Stop timer triggered');
      stopLoading();
    }, 500); // Delay to allow rendering
    
    // Cleanup function: only clear the pending timer
    return () => {
      console.log('NavigationEvents: Cleanup - clearing timer');
      clearTimeout(timer);
    };
    
  // Effect runs when route changes. We don't need start/stop in deps.
  }, [pathname, searchParams, stopLoading]); // Added stopLoading to dependency array as it's used in the effect

  return null;
} 