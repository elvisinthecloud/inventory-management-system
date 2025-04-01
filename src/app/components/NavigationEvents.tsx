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
    
    // Safety timer to ensure it stops eventually
    const safetyTimer = setTimeout(() => {
      console.log('NavigationEvents: Safety timer triggered');
      stopLoading(); 
    }, 3000); 
    
    // Cleanup function: clear timers and ensure loading stops if unmounted quickly
    return () => {
      console.log('NavigationEvents: Cleanup');
      clearTimeout(timer);
      clearTimeout(safetyTimer);
      stopLoading(); 
    };
    
  // Effect runs when route changes. We don't need start/stop in deps.
  }, [pathname, searchParams]); 

  return null;
} 