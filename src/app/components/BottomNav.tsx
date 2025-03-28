import Link from 'next/link';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around items-center h-16">
      <Link href="/dashboard" className="flex flex-col items-center">
        <span className="material-icons">dashboard</span>
        <span className="text-xs">Dashboard</span>
      </Link>
      <Link href="/search" className="flex flex-col items-center">
        <span className="material-icons">search</span>
        <span className="text-xs">Search</span>
      </Link>
      <Link href="/invoices" className="flex flex-col items-center">
        <span className="material-icons">receipt</span>
        <span className="text-xs">Invoices</span>
      </Link>
      <Link href="/menu" className="flex flex-col items-center">
        <span className="material-icons">menu</span>
        <span className="text-xs">Menu</span>
      </Link>
    </nav>
  );
} 