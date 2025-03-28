import Link from 'next/link';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around bg-white shadow-lg">
      <Link href="/dashboard" className="flex w-full flex-col items-center py-1 active:bg-gray-100">
        <span className="material-icons text-gray-900">dashboard</span>
        <span className="text-xs font-medium text-gray-900">Dashboard</span>
      </Link>
      <Link href="/search" className="flex w-full flex-col items-center py-1 active:bg-gray-100">
        <span className="material-icons text-gray-900">search</span>
        <span className="text-xs font-medium text-gray-900">Search</span>
      </Link>
      <Link href="/restaurants" className="flex w-full flex-col items-center py-1 active:bg-gray-100">
        <span className="material-icons text-gray-900">restaurant</span>
        <span className="text-xs font-medium text-gray-900">Restaurants</span>
      </Link>
      <Link href="/invoices" className="flex w-full flex-col items-center py-1 active:bg-gray-100">
        <span className="material-icons text-gray-900">receipt</span>
        <span className="text-xs font-medium text-gray-900">Invoices</span>
      </Link>
      <Link href="/stock" className="flex w-full flex-col items-center py-1 active:bg-gray-100">
        <span className="material-icons text-gray-900">inventory</span>
        <span className="text-xs font-medium text-gray-900">Stock</span>
      </Link>
    </nav>
  );
} 