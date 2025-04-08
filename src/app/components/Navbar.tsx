'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center py-3">
          <div className="flex items-center space-x-4">
            {/* Add Stock management link */}
            <Link href="/stock" className="group flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 transition-colors">
              <span className="material-icons mr-2 text-gray-400 group-hover:text-blue-500">inventory</span>
              Stock
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 