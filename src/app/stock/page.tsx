'use client';

import React, { useState, useEffect } from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import Link from 'next/link';
import { useInvoice } from '../context/InvoiceContext';

const geistSans = Geist({
  weight: '400',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

// Define product type
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function StockManagementPage() {
  // Get product stock from InvoiceContext
  const { getProductStock, updateProductStock } = useInvoice();
  
  // State for products
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stock adjustment states
  const [adjustments, setAdjustments] = useState<{[key: number]: number}>({});
  
  // Search/filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];
  
  // Load products on component mount
  useEffect(() => {
    // In a real app, this would come from an API call
    const loadProducts = () => {
      // Simulate API delay
      setTimeout(() => {
        // Define base product data but get stock levels from context
        const baseProducts = [
          { id: 1, name: 'Cinnamon', category: 'Spices', price: 3.99 },
          { id: 2, name: 'Cardamom', category: 'Spices', price: 5.99 },
          { id: 3, name: 'Turmeric', category: 'Spices', price: 2.99 },
          { id: 4, name: 'Basil', category: 'Herbs', price: 2.49 },
          { id: 5, name: 'Mint', category: 'Herbs', price: 1.99 },
          { id: 6, name: 'Rosemary', category: 'Herbs', price: 2.29 },
          { id: 7, name: 'Vanilla Ice Cream', category: 'Ice Cream', price: 4.99 },
          { id: 8, name: 'Chocolate Ice Cream', category: 'Ice Cream', price: 4.99 },
          { id: 9, name: 'Strawberry Ice Cream', category: 'Ice Cream', price: 5.49 },
          { id: 10, name: 'Tomatoes', category: 'Vegetables', price: 2.99 },
          { id: 11, name: 'Carrots', category: 'Vegetables', price: 1.49 },
          { id: 12, name: 'Broccoli', category: 'Vegetables', price: 1.99 },
          { id: 13, name: 'Apples', category: 'Fruits', price: 3.49 },
          { id: 14, name: 'Bananas', category: 'Fruits', price: 1.29 },
          { id: 15, name: 'Oranges', category: 'Fruits', price: 2.49 },
          { id: 16, name: 'Milk', category: 'Dairy', price: 2.49 },
          { id: 17, name: 'Cheese', category: 'Dairy', price: 3.99 },
          { id: 18, name: 'Yogurt', category: 'Dairy', price: 1.99 },
        ];
        
        // Add stock from context to each product
        const stockProducts = baseProducts.map(product => ({
          ...product,
          stock: getProductStock(product.id)
        }));
        
        setProducts(stockProducts);
        setLoading(false);
      }, 500);
    };
    
    loadProducts();
  }, [getProductStock]);
  
  // Handle adjustment input changes
  const handleAdjustmentChange = (productId: number, value: string) => {
    const numValue = value === '' ? 0 : parseInt(value);
    setAdjustments({
      ...adjustments,
      [productId]: numValue
    });
  };
  
  // Apply stock adjustment
  const applyAdjustment = (productId: number, isAdd: boolean) => {
    const adjustment = adjustments[productId] || 0;
    
    if (adjustment <= 0) {
      alert('Please enter a valid positive number');
      return;
    }
    
    // Get current product
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // Calculate new stock value
    const newStock = isAdd 
      ? product.stock + adjustment 
      : Math.max(0, product.stock - adjustment);
      
    // Update stock in context
    updateProductStock(productId, newStock);
    
    // Update local state to reflect changes
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          return {
            ...product,
            stock: newStock
          };
        }
        return product;
      })
    );
    
    // Clear the adjustment input
    setAdjustments({
      ...adjustments,
      [productId]: 0
    });
    
    alert(`Stock ${isAdd ? 'added' : 'removed'} successfully!`);
  };
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Helper for stock status color
  const getStockStatusColor = (stock: number) => {
    if (stock <= 5) return 'text-red-600';
    if (stock <= 10) return 'text-amber-600';
    return 'text-green-600';
  };
  
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <div className="mb-8 flex items-center">
        <Link href="/" className="mr-4 flex items-center text-blue-600 hover:text-blue-800 transition-colors">
          <span className="text-xl">←</span> <span className="ml-1">Dashboard</span>
        </Link>
        <h1 className={`${robotoMono.className} border-b-4 border-blue-500 pb-2 text-3xl uppercase tracking-wider text-gray-800`}>
          STOCK MANAGEMENT
        </h1>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Products</label>
          <input
            type="text"
            id="search"
            placeholder="Search by name or category"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Filter by Category</label>
          <select
            id="category"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Products Table */}
      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider text-gray-500">Product</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">Category</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider text-gray-500 hidden sm:table-cell">Price</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider text-gray-500">Stock</th>
              <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium uppercase tracking-wider text-gray-500">Adjust</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">Loading products...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">No products found</td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500 mt-1 sm:hidden">{product.category} - ${product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                    <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className={`text-lg font-bold ${getStockStatusColor(product.stock)}`}>
                      {product.stock}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        type="number"
                        min="0"
                        className="block w-14 rounded-md border border-gray-300 px-2 py-1 text-center shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={adjustments[product.id] || ''}
                        onChange={(e) => handleAdjustmentChange(product.id, e.target.value)}
                      />
                      <div className="flex w-full space-x-2">
                        <button
                          onClick={() => applyAdjustment(product.id, true)}
                          className="flex-1 justify-center inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          aria-label={`Add stock to ${product.name}`}
                        >
                          +
                        </button>
                        <button
                          onClick={() => applyAdjustment(product.id, false)}
                          className="flex-1 justify-center inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          aria-label={`Remove stock from ${product.name}`}
                        >
                          -
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 