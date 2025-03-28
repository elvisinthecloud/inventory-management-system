import Link from 'next/link';

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-md flex justify-around items-center h-16">
      <Link href="/dashboard" className="flex flex-col items-center">
        <span className="material-icons text-black">dashboard</span>
        <span className="text-xs text-black">Dashboard</span>
      </Link>
      <Link href="/search" className="flex flex-col items-center">
        <span className="material-icons text-black">search</span>
        <span className="text-xs text-black">Search</span>
      </Link>
      <Link href="/invoices" className="flex flex-col items-center">
        <span className="material-icons text-black">receipt</span>
        <span className="text-xs text-black">Invoices</span>
      </Link>
      <Link href="/menu" className="flex flex-col items-center">
        <span className="material-icons text-black">menu</span>
        <span className="text-xs text-black">Menu</span>
      </Link>
    </nav>
  );
} 