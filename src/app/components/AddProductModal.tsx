'use client';

import React, { useState, useEffect } from 'react';
import { useInvoice } from '../context/InvoiceContext';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategories: string[];
}

interface Product {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  price: number;
  stock: number;
}

// Define a more explicit mapping of default category names to IDs
const DEFAULT_CATEGORY_MAP: {[key: string]: number} = {
  'Spices': 1,
  'Herbs': 2,
  'Ice Cream': 3,
  'Vegetables': 4,
  'Fruits': 5,
  'Dairy': 6
};

export default function AddProductModal({ isOpen, onClose, existingCategories }: AddProductModalProps) {
  const { updateProductStock } = useInvoice();
  
  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [initialStock, setInitialStock] = useState('1');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  
  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('');
      setPrice('');
      setInitialStock('1');
      setCategory(existingCategories[0] || '');
      setNewCategory('');
      setIsAddingNewCategory(false);
    }
  }, [isOpen, existingCategories]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }
    
    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    const stockValue = parseInt(initialStock);
    if (isNaN(stockValue) || stockValue < 0) {
      alert('Please enter a valid stock amount');
      return;
    }
    
    const finalCategory = isAddingNewCategory ? newCategory : category;
    if (!finalCategory.trim()) {
      alert('Please select or enter a category');
      return;
    }
    
    // Find highest existing ID to generate new ID
    // In a real app, this would be handled by the backend
    // This is just a simple example for our localStorage implementation
    const savedStock = localStorage.getItem('productStock');
    const productStock = savedStock ? JSON.parse(savedStock) : {};
    const maxId = Object.keys(productStock).length > 0 
      ? Math.max(...Object.keys(productStock).map(id => parseInt(id)))
      : 0;
    
    const newProductId = maxId + 1;
    
    // Determine category ID for new or existing category
    let categoryId: number;
    
    if (isAddingNewCategory) {
      // For a new category, find the highest category ID and increment
      const productsJson = localStorage.getItem('products');
      const products = productsJson ? JSON.parse(productsJson) : [];
      
      // Get all existing categoryIds
      const existingCategoryIds = products
        .filter((p: Product) => p.categoryId !== undefined)
        .map((p: Product) => p.categoryId);
      
      // Find the max category ID or default to existing categories count
      const maxCategoryId = existingCategoryIds.length > 0
        ? Math.max(...existingCategoryIds)
        : Object.keys(DEFAULT_CATEGORY_MAP).length;
      
      // New category gets a new ID
      categoryId = maxCategoryId + 1;
    } else {
      // For existing category, find the category ID from the products
      const productsJson = localStorage.getItem('products');
      const products = productsJson ? JSON.parse(productsJson) : [];
      
      // First check if it's one of our default categories
      if (DEFAULT_CATEGORY_MAP[category] !== undefined) {
        categoryId = DEFAULT_CATEGORY_MAP[category];
      } else {
        // If not a default category, look for it in existing products
        const matchingProduct = products.find((p: Product) => p.category === category);
        
        // If found, use that categoryId, otherwise generate a new one
        if (matchingProduct && matchingProduct.categoryId) {
          categoryId = matchingProduct.categoryId;
        } else {
          // Get the highest categoryId and increment
          const existingCategoryIds = products
            .filter((p: Product) => p.categoryId !== undefined)
            .map((p: Product) => p.categoryId);
          
          const maxCategoryId = existingCategoryIds.length > 0
            ? Math.max(...existingCategoryIds)
            : Object.keys(DEFAULT_CATEGORY_MAP).length;
          
          categoryId = maxCategoryId + 1;
        }
      }
    }
    
    // Create new product in localStorage
    // First update the stock value through our context
    updateProductStock(newProductId, stockValue);
    
    // Then store the product details
    // In a real app with a database, you would do this differently
    const productsJson = localStorage.getItem('products');
    const products = productsJson ? JSON.parse(productsJson) : [];
    
    const newProduct = {
      id: newProductId,
      name: name.trim(),
      category: finalCategory.trim(),
      categoryId: categoryId,
      price: priceValue,
      stock: stockValue
    };
    
    products.push(newProduct);
    localStorage.setItem('products', JSON.stringify(products));
    
    // Close modal and refresh page to show new product
    onClose();
    window.location.reload(); // In a real app, you would use a better state management approach
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="text-2xl">&times;</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="mb-4">
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              id="product-name"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {/* Category Selection */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            
            {!isAddingNewCategory ? (
              <div className="flex items-center gap-2">
                <select
                  id="category"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setIsAddingNewCategory(true)}
                >
                  New
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="new-category"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-gray-400 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setIsAddingNewCategory(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {/* Price */}
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              id="price"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="0.00"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          
          {/* Initial Stock */}
          <div className="mb-6">
            <label htmlFor="initial-stock" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Stock
            </label>
            <input
              type="number"
              id="initial-stock"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              min="0"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              required
            />
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 