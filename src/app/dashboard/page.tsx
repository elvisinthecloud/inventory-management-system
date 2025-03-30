'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInvoice } from '../context/InvoiceContext';
import PageHeader from '@/app/components/PageHeader';
import { Roboto_Mono } from "next/font/google";

// We'll use a simple chart library
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register the required chart components
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

export default function DashboardPage() {
  const { invoiceHistory } = useInvoice();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Calculate restaurant sales data for pie chart
  const restaurantSales = React.useMemo(() => {
    if (!isClient || !invoiceHistory.length) return { labels: [], data: [] };

    const salesByRestaurant = invoiceHistory.reduce((acc, invoice) => {
      const restaurantName = invoice.restaurant.name;
      if (!acc[restaurantName]) {
        acc[restaurantName] = 0;
      }
      acc[restaurantName] += invoice.total;
      return acc;
    }, {} as Record<string, number>);

    // Sort by total sales (highest first)
    const sortedRestaurants = Object.entries(salesByRestaurant)
      .sort((a, b) => b[1] - a[1]);
    
    // Limit to top 5 if more
    const topRestaurants = sortedRestaurants.slice(0, 5);
    
    return {
      labels: topRestaurants.map(([name]) => name),
      data: topRestaurants.map(([_, value]) => value)
    };
  }, [invoiceHistory, isClient]);

  // Calculate monthly sales data for bar chart
  const monthlySales = React.useMemo(() => {
    if (!isClient || !invoiceHistory.length) return { labels: [], data: [] };

    const salesByMonth: Record<string, number> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Get data for the last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      salesByMonth[monthKey] = 0;
    }

    // Calculate sales for each month
    invoiceHistory.forEach(invoice => {
      const invoiceDate = new Date(invoice.date);
      const monthKey = `${monthNames[invoiceDate.getMonth()]} ${invoiceDate.getFullYear()}`;
      
      // Only include if it's in our last 6 months
      if (salesByMonth[monthKey] !== undefined) {
        salesByMonth[monthKey] += invoice.total;
      }
    });

    return {
      labels: Object.keys(salesByMonth),
      data: Object.values(salesByMonth)
    };
  }, [invoiceHistory, isClient]);

  // Calculate quick stats
  const stats = React.useMemo(() => {
    if (!isClient) return { totalSales: 0, totalOrders: 0, avgOrderValue: 0 };

    // Get current month
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Filter invoices for current month only
    const currentMonthInvoices = invoiceHistory.filter(invoice => {
      const invoiceDate = new Date(invoice.date);
      return invoiceDate.getMonth() === currentMonth && invoiceDate.getFullYear() === currentYear;
    });

    const totalSales = currentMonthInvoices.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalOrders = currentMonthInvoices.length;
    const avgOrderValue = totalOrders ? totalSales / totalOrders : 0;

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders,
      avgOrderValue: avgOrderValue.toFixed(2)
    };
  }, [invoiceHistory, isClient]);

  // Calculate all time stats
  const allTimeStats = React.useMemo(() => {
    if (!isClient) return { totalSales: 0, totalOrders: 0, avgOrderValue: 0 };

    const totalSales = invoiceHistory.reduce((sum, invoice) => sum + invoice.total, 0);
    const totalOrders = invoiceHistory.length;
    const avgOrderValue = totalOrders ? totalSales / totalOrders : 0;

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders,
      avgOrderValue: avgOrderValue.toFixed(2)
    };
  }, [invoiceHistory, isClient]);

  // Data for the pie chart
  const pieChartData = {
    labels: restaurantSales.labels,
    datasets: [
      {
        data: restaurantSales.data,
        backgroundColor: [
          '#4B5563', // gray-600
          '#1F2937', // gray-800
          '#111827', // gray-900
          '#6B7280', // gray-500
          '#9CA3AF', // gray-400
        ],
        borderColor: [
          '#ffffff',
          '#ffffff',
          '#ffffff',
          '#ffffff',
          '#ffffff',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Data for the bar chart
  const barChartData = {
    labels: monthlySales.labels,
    datasets: [
      {
        label: 'Monthly Sales ($)',
        data: monthlySales.data,
        backgroundColor: '#1F2937',
        borderColor: '#111827',
        borderWidth: 1,
      },
    ],
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Get current month name
  const getCurrentMonthName = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[new Date().getMonth()];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Full-width header */}
      <PageHeader 
        title="DASHBOARD" 
        fullWidth={true}
        withAction={
          <Link
            href="/todo" 
            className="flex items-center rounded-md bg-gray-700 px-3 py-2 text-gray-200 hover:bg-gray-600"
          >
            <span className="material-icons mr-1">assignment</span>
            <span className="hidden sm:inline">To-Do List</span>
            <span className="sm:hidden">To-Do</span>
          </Link>
        }
      />

      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-20 pt-2 flex-grow">
        {/* Monthly Performance Stats - Prominently displayed at top */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Performance ({getCurrentMonthName()})</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">TOTAL SALES THIS MONTH</h3>
              <p className={`${robotoMono.className} text-4xl font-bold text-gray-900`}>${stats.totalSales}</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">ORDERS THIS MONTH</h3>
              <p className={`${robotoMono.className} text-4xl font-bold text-gray-900`}>{stats.totalOrders}</p>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">AVG ORDER VALUE</h3>
              <p className={`${robotoMono.className} text-4xl font-bold text-gray-900`}>${stats.avgOrderValue}</p>
            </div>
          </div>
        </div>

        {/* Top Restaurants by Sales & Order Stats */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-6">
          {/* Restaurant Performance Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Restaurants by Sales</h3>
            <div className="h-64">
              {isClient && restaurantSales.labels.length > 0 ? (
                <Pie data={pieChartData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Statistics */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">All-Time Statistics</h3>
            <div className="grid grid-cols-1 gap-4 h-auto overflow-hidden">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-1">TOTAL ORDERS</h4>
                <p className={`${robotoMono.className} text-2xl font-bold text-gray-900`}>{allTimeStats.totalOrders}</p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-1">TOTAL REVENUE</h4>
                <p className={`${robotoMono.className} text-2xl font-bold text-gray-900`}>${allTimeStats.totalSales}</p>
      </div>
      
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-600 mb-1">AVERAGE ORDER VALUE</h4>
                <p className={`${robotoMono.className} text-2xl font-bold text-gray-900`}>${allTimeStats.avgOrderValue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Sales Trend</h3>
          <div className="h-80">
            {isClient && monthlySales.labels.length > 0 ? (
              <Bar 
                data={barChartData} 
                options={barChartOptions}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No data available</p>
            </div>
          )}
          </div>
        </div>

        {/* Recent Activity & Quick Access */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
              <Link 
                href="/history" 
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                View All
              </Link>
            </div>
            
            {isClient && invoiceHistory.length > 0 ? (
              <div className="space-y-4">
                {invoiceHistory.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center p-3 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{invoice.restaurant.name}</p>
                      <p className="text-sm text-gray-600">Invoice #{invoice.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${invoice.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center p-4">No recent activity</p>
            )}
          </div>

          {/* Quick Access */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Link href="/search" className="p-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <span className="material-icons text-2xl text-gray-700 mb-2">search</span>
                <span className="text-sm font-medium text-gray-900">Search</span>
              </Link>
              
              <Link href="/restaurants" className="p-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <span className="material-icons text-2xl text-gray-700 mb-2">restaurant</span>
                <span className="text-sm font-medium text-gray-900">Restaurants</span>
              </Link>
              
              <Link href="/history" className="p-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <span className="material-icons text-2xl text-gray-700 mb-2">history</span>
                <span className="text-sm font-medium text-gray-900">History</span>
              </Link>
              
              <Link href="/stock" className="p-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <span className="material-icons text-2xl text-gray-700 mb-2">inventory</span>
                <span className="text-sm font-medium text-gray-900">Stock</span>
              </Link>
              
              <Link href="/todo" className="p-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <span className="material-icons text-2xl text-gray-700 mb-2">assignment</span>
                <span className="text-sm font-medium text-gray-900">To-Do</span>
              </Link>
              
              <Link href="/invoices" className="p-4 flex flex-col items-center justify-center bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200">
                <span className="material-icons text-2xl text-gray-700 mb-2">receipt</span>
                <span className="text-sm font-medium text-gray-900">Invoices</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 