'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  SquaresPlusIcon,
  CubeIcon,
  TruckIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Products', href: '/products', icon: CubeIcon },
  { name: 'Categories', href: '/categories', icon: SquaresPlusIcon },
  { name: 'Deliveries', href: '/deliveries', icon: TruckIcon },
  { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
  { name: 'Inventory', href: '/inventory', icon: ClipboardDocumentListIcon },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200">
      <div className="grid h-full grid-cols-6 mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`inline-flex flex-col items-center justify-center px-1 ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              <item.icon
                className={`w-6 h-6 mb-1 ${isActive ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-600'}`}
                aria-hidden="true"
              />
              <span className="text-xs">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 