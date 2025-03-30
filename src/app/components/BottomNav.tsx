'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-14 items-center justify-around bg-white shadow-lg">
      <Link 
        href="/dashboard" 
        className="relative flex w-full flex-col items-center justify-center py-2"
      >
        <span className={`material-icons text-3xl transition-all duration-200 ${pathname === '/dashboard' ? 'text-blue-600 scale-110' : 'text-gray-900'}`}>home</span>
        {pathname === '/dashboard' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600"></span>
        )}
      </Link>
      <Link 
        href="/search" 
        className="relative flex w-full flex-col items-center justify-center py-2"
      >
        <span className={`material-icons text-3xl transition-all duration-200 ${pathname === '/search' ? 'text-blue-600 scale-110' : 'text-gray-900'}`}>manage_search</span>
        {pathname === '/search' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600"></span>
        )}
      </Link>
      <Link 
        href="/restaurants" 
        className="relative flex w-full flex-col items-center justify-center py-2"
      >
        <span className={`material-icons text-3xl transition-all duration-200 ${pathname === '/restaurants' ? 'text-blue-600 scale-110' : 'text-gray-900'}`}>restaurant_menu</span>
        {pathname === '/restaurants' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600"></span>
        )}
      </Link>
      <Link 
        href="/invoices" 
        className="relative flex w-full flex-col items-center justify-center py-2"
      >
        <span className={`material-icons text-3xl transition-all duration-200 ${pathname === '/invoices' ? 'text-blue-600 scale-110' : 'text-gray-900'}`}>receipt_long</span>
        {pathname === '/invoices' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600"></span>
        )}
      </Link>
      <Link 
        href="/history" 
        className="relative flex w-full flex-col items-center justify-center py-2"
      >
        <span className={`material-icons text-3xl transition-all duration-200 ${pathname === '/history' ? 'text-blue-600 scale-110' : 'text-gray-900'}`}>history</span>
        {pathname === '/history' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600"></span>
        )}
      </Link>
      <Link 
        href="/stock" 
        className="relative flex w-full flex-col items-center justify-center py-2"
      >
        <span className={`material-icons text-3xl transition-all duration-200 ${pathname === '/stock' ? 'text-blue-600 scale-110' : 'text-gray-900'}`}>inventory_2</span>
        {pathname === '/stock' && (
          <span className="absolute bottom-1 h-1 w-1 rounded-full bg-blue-600"></span>
        )}
      </Link>
    </nav>
  );
} 