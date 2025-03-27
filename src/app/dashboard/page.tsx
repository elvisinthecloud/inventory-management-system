import Link from 'next/link';
import { products, deliveries, invoices } from '@/app/lib/placeholder-data';

export default function DashboardPage() {
  // Calculate summary statistics
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.status === 'Low Stock').length;
  const outOfStockProducts = products.filter(p => p.status === 'Out of Stock').length;
  
  const pendingDeliveries = deliveries.filter(d => d.status === 'Pending').length;
  const pendingInvoices = invoices.filter(i => i.status === 'Pending').length;
  const overdueInvoices = invoices.filter(i => i.status === 'Overdue').length;
  
  // Calculate total inventory value
  const inventoryValue = products.reduce((sum, product) => {
    return sum + (product.price * product.stock);
  }, 0);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Total Products</h2>
          <p className="text-2xl font-bold">{totalProducts}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-gray-500 text-sm font-medium">Inventory Value</h2>
          <p className="text-2xl font-bold">${inventoryValue.toFixed(2)}</p>
        </div>
      </div>
      
      {/* Quick Access */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Quick Access</h2>
        <div className="grid grid-cols-3 gap-2">
          <Link
            href="/products"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow text-center"
          >
            <span className="text-xs">Products</span>
          </Link>
          
          <Link
            href="/categories"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow text-center"
          >
            <span className="text-xs">Categories</span>
          </Link>
          
          <Link
            href="/deliveries"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow text-center"
          >
            <span className="text-xs">Deliveries</span>
          </Link>
          
          <Link
            href="/invoices"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow text-center"
          >
            <span className="text-xs">Invoices</span>
          </Link>
          
          <Link
            href="/inventory"
            className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow text-center"
          >
            <span className="text-xs">Inventory</span>
          </Link>
        </div>
      </div>
      
      {/* Activity Summary */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Activity</h2>
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          {pendingDeliveries > 0 && (
            <div className="flex items-center">
              <p className="text-sm">
                <span className="font-medium">{pendingDeliveries}</span> pending deliveries
              </p>
            </div>
          )}
          
          {pendingInvoices > 0 && (
            <div className="flex items-center">
              <p className="text-sm">
                <span className="font-medium">{pendingInvoices}</span> pending invoices
              </p>
            </div>
          )}
          
          {overdueInvoices > 0 && (
            <div className="flex items-center">
              <p className="text-sm">
                <span className="font-medium">{overdueInvoices}</span> overdue invoices
              </p>
            </div>
          )}
          
          {pendingDeliveries === 0 && pendingInvoices === 0 && overdueInvoices === 0 && (
            <p className="text-sm text-gray-500">No pending activities</p>
          )}
        </div>
      </div>
    </main>
  );
} 