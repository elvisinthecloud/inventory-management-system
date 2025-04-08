'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useInvoice } from '../context/InvoiceContext';
import PageHeader from '@/app/components/PageHeader';
import { Roboto_Mono } from "next/font/google";
import UpcomingTasksBadge from '@/app/components/UpcomingTasksBadge';

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
      data: topRestaurants.map(([, count]) => count)
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
    if (!isClient) return { totalSales: 0, totalOrders: 0, avgOrderValue: 0, uniqueStoresDeliveredTo: 0 };

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

    // Calculate unique stores delivered to this month
    const uniqueStoreIds = new Set(currentMonthInvoices.map(invoice => invoice.restaurant.id));
    const uniqueStoresDeliveredTo = uniqueStoreIds.size;

    return {
      totalSales: totalSales.toFixed(2),
      totalOrders,
      avgOrderValue: avgOrderValue.toFixed(2),
      uniqueStoresDeliveredTo
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

  // --- CHART COLORS --- 
  const pieChartColors = [
    '#2563eb', // blue-600
    '#16a34a', // green-600
    '#d97706', // amber-600
    '#4f46e5', // indigo-600
    '#db2777'  // pink-600
  ];
  
  const barChartColor = '#1d4ed8'; // blue-700
  // ----------------------

  // Data for the pie chart
  const pieChartData = {
    labels: restaurantSales.labels,
    datasets: [
      {
        data: restaurantSales.data,
        backgroundColor: pieChartColors,
        borderColor: '#ffffff',
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
        backgroundColor: barChartColor,
        borderColor: barChartColor, // Use same color for border
        borderWidth: 1,
        borderRadius: 4, // Add rounded corners to bars
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
      tooltip: { // Customize tooltips
        backgroundColor: '#262626', // neutral-800
        titleColor: '#ffffff',
        bodyColor: '#d4d4d4', // neutral-300
        padding: 10,
        cornerRadius: 4,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { // Add subtle grid lines
          color: '#e5e7eb' // gray-200
        }
      },
      x: {
        grid: {
          display: false // Hide vertical grid lines
        }
      }
    },
  };

  // Get current month name
  const getCurrentMonthName = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
    return monthNames[new Date().getMonth()];
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Full-width header */}
      <PageHeader 
        title="DASHBOARD" 
        fullWidth={true}
        withAction={
          <div className="flex items-center">
            <Link
              href="/todo" 
              className="flex items-center rounded-md bg-gray-700 px-3 py-2 text-gray-200 hover:bg-gray-600"
            >
              <span className="material-icons mr-1">assignment</span>
              <span className="hidden sm:inline">To-Do List</span>
              <span className="sm:hidden">To-Do</span>
            </Link>
            <UpcomingTasksBadge />
          </div>
        }
      />

      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-28 pt-4 flex-grow">
        {/* Monthly Performance Stats - Blue theme */}
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
          <h2 className="text-xl font-bold mb-4">Monthly Performance ({getCurrentMonthName()})</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <div className="p-6 bg-blue-700 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-blue-100 mb-2">TOTAL SALES THIS MONTH</h3>
              <p className={`${robotoMono.className} text-4xl font-bold`}>${stats.totalSales}</p>
            </div>
            
            <div className="p-6 bg-blue-700 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-blue-100 mb-2">STORES DELIVERED TO</h3>
              <p className={`${robotoMono.className} text-4xl font-bold`}>{stats.uniqueStoresDeliveredTo}</p>
            </div>
            
            <div className="p-6 bg-blue-700 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-blue-100 mb-2">AVG ORDER VALUE</h3>
              <p className={`${robotoMono.className} text-4xl font-bold`}>${stats.avgOrderValue}</p>
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
                <Pie data={pieChartData} options={{ plugins: { legend: { position: 'bottom' } } }} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Statistics - Green theme */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
            <h3 className="text-lg font-bold mb-4">All-Time Statistics</h3>
            <div className="grid grid-cols-1 gap-4 h-auto overflow-hidden">
              <div className="p-4 bg-green-700 rounded-lg shadow-md">
                <h4 className="text-sm font-medium text-green-100 mb-1">TOTAL ORDERS</h4>
                <p className={`${robotoMono.className} text-2xl font-bold`}>{allTimeStats.totalOrders}</p>
              </div>
              
              <div className="p-4 bg-green-700 rounded-lg shadow-md">
                <h4 className="text-sm font-medium text-green-100 mb-1">TOTAL REVENUE</h4>
                <p className={`${robotoMono.className} text-2xl font-bold`}>${allTimeStats.totalSales}</p>
              </div>
              
              <div className="p-4 bg-green-700 rounded-lg shadow-md">
                <h4 className="text-sm font-medium text-green-100 mb-1">AVERAGE ORDER VALUE</h4>
                <p className={`${robotoMono.className} text-2xl font-bold`}>${allTimeStats.avgOrderValue}</p>
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
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View All
              </Link>
            </div>
            
            {isClient && invoiceHistory.length > 0 ? (
              <div className="space-y-3">
                {invoiceHistory.slice(0, 5).map((invoice) => (
                  <Link 
                    key={invoice.id} 
                    href={`/history#${invoice.id}`}
                    className="block p-3 border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-150"
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <span className="material-icons text-blue-500">receipt</span>
                      </div>
                      <div className="flex-1 ml-3">
                        <p className="font-medium text-gray-900">{invoice.restaurant.name}</p>
                        <p className="text-sm text-gray-600">Invoice #{invoice.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${invoice.total.toFixed(2)}</p>
                        <p className="text-xs text-gray-500">{new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center p-4">No recent activity</p>
            )}
          </div>

          {/* Quick Access - Funner buttons */}
          <div className="bg-gradient-to-bl from-amber-400 to-orange-500 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4">Quick Access</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[ 
                { href: "/search", icon: "search", label: "Search", color: "bg-blue-500 hover:bg-blue-600" },
                { href: "/restaurants", icon: "restaurant", label: "Stores", color: "bg-green-500 hover:bg-green-600" },
                { href: "/history", icon: "history", label: "History", color: "bg-purple-500 hover:bg-purple-600" },
                { href: "/stock", icon: "inventory", label: "Stock", color: "bg-yellow-500 hover:bg-yellow-600 text-black" },
                { href: "/todo", icon: "assignment", label: "To-Do", color: "bg-teal-500 hover:bg-teal-600" },
                { href: "/invoices", icon: "receipt", label: "Invoice", color: "bg-indigo-500 hover:bg-indigo-600" }
              ].map(link => (
                <Link key={link.href} href={link.href} className={`p-4 flex flex-col items-center justify-center rounded-lg ${link.color} text-white shadow-md hover:shadow-lg transition-all duration-200 ease-in-out transform hover:-translate-y-1`}>
                  <span className="material-icons text-3xl mb-1">{link.icon}</span>
                  <span className="text-sm font-semibold text-center">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 