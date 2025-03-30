'use client';

import React, { useState, useEffect } from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import Link from 'next/link';
import { useInvoice } from '../context/InvoiceContext';
import AddProductModal from '../components/AddProductModal';
import PageHeader from '@/app/components/PageHeader';

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
  
  // Add product modal state
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  
  // Add a new state for product edit modal
  const [editProductId, setEditProductId] = useState<number | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProductData, setEditProductData] = useState<{
    name: string;
    price: string;
    category: string;
  }>({
    name: '',
    price: '',
    category: '',
  });
  
  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];
  
  // Load products on component mount
  useEffect(() => {
    const loadProducts = () => {
      setLoading(true);
      console.log("Loading products data from localStorage");
      
      // Try to get products from localStorage
      const productsJson = localStorage.getItem('products');
      
      if (productsJson) {
        try {
          // If products exist in localStorage, use them
          const savedProducts = JSON.parse(productsJson);
          console.log(`Found ${savedProducts.length} products in localStorage`);
          
          // Update stock values from context
          const productsWithUpdatedStock = savedProducts.map((product: Product) => {
            const currentStock = getProductStock(product.id);
            console.log(`Product ${product.name} (ID: ${product.id}) - Stock: ${currentStock !== 0 ? product.stock : 0}`);
            return {
              ...product,
              // Only override with context stock if it's not 0, otherwise keep the localStorage value
              stock: currentStock !== 0 ? currentStock : product.stock
            };
          });
          
          setProducts(productsWithUpdatedStock);
          console.log("Products loaded with current stock values");
        } catch (error) {
          console.error("Error parsing products from localStorage:", error);
          // Fallback to default products if there's an error
          setProducts([]);
        }
      } else {
        // Otherwise, use our default products
        console.log("No products found in localStorage, using default products");
        const baseProducts = [
          { id: 1, name: 'Cinnamon', category: 'Spices', price: 3.99, stock: 15 },
          { id: 2, name: 'Cardamom', category: 'Spices', price: 5.99, stock: 8 },
          { id: 3, name: 'Turmeric', category: 'Spices', price: 2.99, stock: 20 },
          { id: 4, name: 'Basil', category: 'Herbs', price: 2.49, stock: 12 },
          { id: 5, name: 'Mint', category: 'Herbs', price: 1.99, stock: 18 },
          { id: 6, name: 'Rosemary', category: 'Herbs', price: 2.29, stock: 5 },
          { id: 7, name: 'Vanilla Ice Cream', category: 'Ice Cream', price: 4.99, stock: 10 },
          { id: 8, name: 'Chocolate Ice Cream', category: 'Ice Cream', price: 4.99, stock: 14 },
          { id: 9, name: 'Strawberry Ice Cream', category: 'Ice Cream', price: 5.49, stock: 7 },
          { id: 10, name: 'Tomatoes', category: 'Vegetables', price: 2.99, stock: 25 },
          { id: 11, name: 'Carrots', category: 'Vegetables', price: 1.49, stock: 30 },
          { id: 12, name: 'Broccoli', category: 'Vegetables', price: 1.99, stock: 15 },
          { id: 13, name: 'Apples', category: 'Fruits', price: 3.49, stock: 40 },
          { id: 14, name: 'Bananas', category: 'Fruits', price: 1.29, stock: 35 },
          { id: 15, name: 'Oranges', category: 'Fruits', price: 2.49, stock: 22 },
          { id: 16, name: 'Milk', category: 'Dairy', price: 2.49, stock: 42 },
          { id: 17, name: 'Cheese', category: 'Dairy', price: 3.99, stock: 6 },
          { id: 18, name: 'Yogurt', category: 'Dairy', price: 1.99, stock: 18 },
        ];
        
        // Initialize context stock values for each product
        baseProducts.forEach(product => {
          if (getProductStock(product.id) === 0) {
            updateProductStock(product.id, product.stock);
          }
        });
        
        // Save products with stock to localStorage
        localStorage.setItem('products', JSON.stringify(baseProducts));
        
        setProducts(baseProducts);
      }
      
      setLoading(false);
    };
    
    loadProducts();
    
    // Add event listener for focus/visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Page became visible, refreshing stock data");
        loadProducts();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [getProductStock, updateProductStock]);
  
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
    
    // Get current product
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // If adjustment is 0 or not set, use 1 as the default increment/decrement amount
    const amountToAdjust = adjustment > 0 ? adjustment : 1;
    
    // Calculate new stock value
    const newStock = isAdd 
      ? product.stock + amountToAdjust 
      : Math.max(0, product.stock - amountToAdjust);
      
    console.log(`Adjusting stock for ${product.name}: ${product.stock} → ${newStock} (${isAdd ? 'adding' : 'subtracting'} ${amountToAdjust})`);
    
    // Update stock in context
    updateProductStock(productId, newStock);
    
    // Update local state to reflect changes
    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return {
          ...p,
          stock: newStock
        };
      }
      return p;
    });
    
    // Update state
    setProducts(updatedProducts);
    
    // Save changes to localStorage
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    console.log(`Saved updated stock to localStorage for product ${productId}`);
    
    // Clear the adjustment input only if we actually used the input value
    if (adjustment > 0) {
      setAdjustments({
        ...adjustments,
        [productId]: 0
      });
    }
  };
  
  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Update the getStockStatusColor function to return both text and background colors
  const getStockStatusClass = (stock: number) => {
    if (stock <= 5) return { text: 'text-red-600', bg: 'bg-red-600' };
    if (stock <= 10) return { text: 'text-amber-600', bg: 'bg-amber-600' };
    return { text: 'text-green-600', bg: 'bg-green-600' };
  };

  // Calculate inventory statistics
  const inStockProducts = products.filter(p => p.stock > 10).length;
  const lowStockProducts = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  
  // Function to open edit modal
  const openEditModal = (product: Product) => {
    setEditProductId(product.id);
    setEditProductData({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
    });
    setIsEditModalOpen(true);
  };

  // Function to save edited product
  const saveEditedProduct = () => {
    if (!editProductId) return;
    
    // Validate input
    if (!editProductData.name.trim()) {
      alert('Product name is required');
      return;
    }
    
    const priceValue = parseFloat(editProductData.price);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    // Update products array
    const updatedProducts = products.map(product => {
      if (product.id === editProductId) {
        return {
          ...product,
          name: editProductData.name.trim(),
          price: priceValue,
          category: editProductData.category,
        };
      }
      return product;
    });
    
    // Save to localStorage
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    
    // Update state
    setProducts(updatedProducts);
    
    // Close modal
    setIsEditModalOpen(false);
    setEditProductId(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Full-width header */}
      <PageHeader 
        title="INVENTORY" 
        fullWidth={true}
        withAction={
          <button
            onClick={() => setIsAddProductModalOpen(true)}
            className="inline-flex items-center rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:bg-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Product
          </button>
        }
      />

      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-28 pt-2 flex-grow">
        {/* Top Action Bar */}
        <div className="mb-6 flex justify-between items-center">
          <button 
            onClick={() => {
              setLoading(true);
              console.log("Manual refresh of stock data requested");
              
              // Force reload products data from localStorage
              const productsJson = localStorage.getItem('products');
              if (productsJson) {
                try {
                  const savedProducts = JSON.parse(productsJson);
                  console.log(`Loaded ${savedProducts.length} products from localStorage`);
                  
                  // Use the stock values directly from localStorage
                  setProducts(savedProducts);
                  
                  // Also ensure context has the latest values
                  savedProducts.forEach((product: Product) => {
                    updateProductStock(product.id, product.stock);
                  });
                  
                  console.log("✅ Stock data refreshed successfully from localStorage");
                } catch (error) {
                  console.error("Error refreshing stock data:", error);
                } finally {
                  setLoading(false);
                }
              } else {
                console.warn("No products found in localStorage during refresh");
                setLoading(false);
              }
            }}
            className="inline-flex items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-800 shadow-md transition-all hover:bg-gray-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh Stock
          </button>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="mb-6 space-y-6">
          <div className="w-full">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">Search Products</label>
            <div className="relative bg-white rounded-md shadow-md border border-gray-300">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                placeholder="Search by name or category"
                className="pl-10 mt-0 block w-full rounded-md border-0 bg-white px-3 py-2.5 ring-0 focus:ring-2 focus:ring-gray-500 text-gray-900 font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Filter by Category</label>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory('')}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
                >
                  Clear Filter
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === '' 
                    ? 'bg-gray-800 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All Categories
              </button>
              
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category 
                      ? 'bg-gray-800 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Category stats */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="text-xs text-gray-500 mb-1">Total Categories</div>
                <div className="text-lg font-bold text-gray-800">{categories.length}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="text-xs text-gray-500 mb-1">In Stock</div>
                <div className="text-lg font-bold text-green-600">{inStockProducts}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="text-xs text-gray-500 mb-1">Low Stock</div>
                <div className="text-lg font-bold text-amber-600">{lowStockProducts}</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
                <div className="text-xs text-gray-500 mb-1">Out of Stock</div>
                <div className="text-lg font-bold text-red-600">{outOfStockProducts}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Table */}
        <div className="mt-6 bg-white overflow-hidden rounded-lg border border-gray-200 shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">Product Name</th>
                <th scope="col" className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Category</th>
                <th scope="col" className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500 hidden sm:table-cell">Price</th>
                <th scope="col" className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">Stock</th>
                <th scope="col" className="px-4 sm:px-6 py-3.5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-base font-medium text-gray-900">{product.name}</div>
                        </div>
                        <div className="relative group">
                          <button 
                            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                            onClick={() => openEditModal(product)}
                            aria-label={`Options for ${product.name}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                            </svg>
                          </button>
                          <div className="absolute right-0 mt-1 w-28 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                            Edit product
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 sm:hidden">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-700">{product.category}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                      <div className="text-sm text-gray-700">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${getStockStatusClass(product.stock).bg} mr-2`}></div>
                        <div className={`text-lg font-bold ${getStockStatusClass(product.stock).text}`}>
                          {product.stock}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center border border-gray-300 rounded-md">
                          <input
                            type="number"
                            min="0"
                            value={adjustments[product.id] || ''}
                            onChange={(e) => handleAdjustmentChange(product.id, e.target.value)}
                            className="w-14 py-1 px-2 border-0 focus:ring-0 text-center text-sm text-black dark:text-black !text-black font-medium"
                            placeholder="Qty"
                          />
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => applyAdjustment(product.id, true)}
                            className="p-1 rounded-md text-green-600 hover:text-green-800 hover:bg-green-50"
                            title={adjustments[product.id] > 0 ? `Add ${adjustments[product.id]} to stock` : "Add 1 to stock"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                          <button
                            onClick={() => applyAdjustment(product.id, false)}
                            className="p-1 rounded-md text-red-600 hover:text-red-800 hover:bg-red-50"
                            title={adjustments[product.id] > 0 ? `Remove ${adjustments[product.id]} from stock` : "Remove 1 from stock"}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
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
        
        {/* Modals */}
        {isAddProductModalOpen && (
          <AddProductModal
            isOpen={isAddProductModalOpen}
            onClose={() => {
              setIsAddProductModalOpen(false);
              // Reload products from localStorage after modal is closed
              const productsJson = localStorage.getItem('products');
              if (productsJson) {
                try {
                  const savedProducts = JSON.parse(productsJson);
                  setProducts(savedProducts);
                } catch (error) {
                  console.error("Error parsing products:", error);
                }
              }
            }}
            existingCategories={categories}
          />
        )}
        
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900">Edit Product</h3>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    value={editProductData.name}
                    onChange={(e) => setEditProductData({...editProductData, name: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 p-2 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    id="price"
                    min="0"
                    step="0.01"
                    value={editProductData.price}
                    onChange={(e) => setEditProductData({...editProductData, price: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 p-2 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    id="category"
                    list="categories"
                    value={editProductData.category}
                    onChange={(e) => setEditProductData({...editProductData, category: e.target.value})}
                    className="block w-full rounded-md border border-gray-300 p-2 focus:border-gray-500 focus:ring-gray-500"
                  />
                  <datalist id="categories">
                    {categories.map(category => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </div>
              </div>
              
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedProduct}
                  className="px-4 py-2 bg-gray-800 rounded-md text-white hover:bg-gray-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 