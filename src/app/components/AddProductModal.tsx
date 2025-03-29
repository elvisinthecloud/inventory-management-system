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

// Define a consistent mapping of default category names to IDs
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
    
    try {
      console.log('Creating new product with category:', finalCategory);
      
      // Find highest existing ID to generate new ID
      // In a real app, this would be handled by the backend
      // This is just a simple example for our localStorage implementation
      const savedStock = localStorage.getItem('productStock');
      const productStock = savedStock ? JSON.parse(savedStock) : {};
      const maxId = Object.keys(productStock).length > 0 
        ? Math.max(...Object.keys(productStock).map(id => parseInt(id)))
        : 0;
      
      const newProductId = maxId + 1;
      
      // First update the stock value through our context
      updateProductStock(newProductId, stockValue);
      
      // For a new category, we need to generate a unique ID
      const productsJson = localStorage.getItem('products');
      const products = productsJson ? JSON.parse(productsJson) : [];
      
      // Collect all used category IDs
      const usedCategoryIds = new Set<number>();
      
      // Add default category IDs
      Object.values(DEFAULT_CATEGORY_MAP).forEach(id => {
        usedCategoryIds.add(id);
      });
      
      // Add existing category IDs from products
      products.forEach((p: Product) => {
        if (p.categoryId) {
          usedCategoryIds.add(p.categoryId);
        }
      });
      
      console.log('Used category IDs:', Array.from(usedCategoryIds));
      
      // Determine category ID for new or existing category
      let categoryId: number;
      
      if (isAddingNewCategory) {
        // Start with the next ID after the default categories
        let nextId = Object.keys(DEFAULT_CATEGORY_MAP).length + 1;
        
        // Find the next available ID that's not in use
        while (usedCategoryIds.has(nextId)) {
          nextId++;
        }
        
        // New category gets this unique ID
        categoryId = nextId;
        console.log('Generated new category ID:', categoryId, 'for new category:', newCategory);
      } else {
        // For existing category
        
        // First check if it's one of our default categories
        if (DEFAULT_CATEGORY_MAP[category] !== undefined) {
          categoryId = DEFAULT_CATEGORY_MAP[category];
          console.log('Using default category ID:', categoryId, 'for category:', category);
        } else {
          // If not a default category, look for it in existing products
          const matchingProduct = products.find((p: Product) => p.category === category);
          
          // If found, use that categoryId
          if (matchingProduct && matchingProduct.categoryId) {
            categoryId = matchingProduct.categoryId;
            console.log('Using existing category ID:', categoryId, 'from product:', matchingProduct.name);
          } else {
            // Generate a new unique ID for this category
            // Start with the next ID after the default categories
            let nextId = Object.keys(DEFAULT_CATEGORY_MAP).length + 1;
            
            // Find the next available ID that's not in use
            while (usedCategoryIds.has(nextId)) {
              nextId++;
            }
            
            categoryId = nextId;
            console.log('Generated new category ID:', categoryId, 'for existing category without ID:', category);
          }
        }
      }
      
      // Create new product with the determined categoryId
      const newProduct = {
        id: newProductId,
        name: name.trim(),
        category: finalCategory.trim(),
        categoryId: categoryId,
        price: priceValue,
        stock: stockValue
      };
      
      console.log('Adding new product:', newProduct);
      
      products.push(newProduct);
      localStorage.setItem('products', JSON.stringify(products));
      
      // Close modal and refresh page to show new product
      onClose();
      window.location.reload(); // In a real app, you would use a better state management approach
    } catch (error) {
      console.error('Error creating product:', error);
      alert('There was an error creating the product. Please try again.');
      return;
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-5 pb-3 border-b">
          <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Product Name */}
          <div className="mb-5">
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <input
              type="text"
              id="product-name"
              className="block w-full rounded-md border border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              placeholder="Enter product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          {/* Category Selection */}
          <div className="mb-5">
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            
            {!isAddingNewCategory ? (
              <div className="flex items-center gap-2">
                <select
                  id="category"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
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
                  className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
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
                  className="block w-full rounded-md border border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter new category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="inline-flex items-center rounded-md border border-gray-400 bg-white px-3 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  onClick={() => setIsAddingNewCategory(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          
          {/* Price */}
          <div className="mb-5">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="price"
                className="block w-full rounded-md border border-gray-300 pl-7 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Initial Stock */}
          <div className="mb-6">
            <label htmlFor="initial-stock" className="block text-sm font-medium text-gray-700 mb-1">
              Initial Stock
            </label>
            <input
              type="number"
              id="initial-stock"
              className="block w-full rounded-md border border-gray-300 px-3 py-2.5 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              min="0"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              required
            />
          </div>
          
          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Add Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 