'use client';

import React, { useState } from 'react';
import { useInvoice } from '../context/InvoiceContext';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, invoice, updateQuantity, removeItem } = useInvoice();
  const [addingToInvoice, setAddingToInvoice] = useState(false);
  
  // Find if this product is already in the invoice
  const invoiceItem = invoice.items.find(item => item.id === product.id);
  const quantity = invoiceItem ? invoiceItem.quantity : 0;

  // Function to determine if we've reached the stock limit
  const isStockLimitReached = quantity >= product.stock;

  const handleAddToInvoice = () => {
    // Check if a restaurant is selected
    if (!invoice.restaurant) {
      alert('Please select a restaurant first');
      return;
    }

    // Check if we'll exceed stock
    if (isStockLimitReached) {
      alert(`Cannot add more than ${product.stock} units of ${product.name} (Stock limit)`);
      return;
    }

    // Show visual feedback during add
    setAddingToInvoice(true);

    // Add item to invoice
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category
    });
    
    // Reset visual feedback after a delay
    setTimeout(() => {
      setAddingToInvoice(false);
    }, 300);
  };

  const handleIncreaseQuantity = () => {
    if (!invoice.restaurant) {
      alert('Please select a restaurant first');
      return;
    }

    // Check if we'll exceed stock
    if (isStockLimitReached) {
      alert(`Cannot add more than ${product.stock} units of ${product.name} (Stock limit)`);
      return;
    }
    
    // Show visual feedback
    setAddingToInvoice(true);
    
    if (quantity === 0) {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category
      });
    } else {
      updateQuantity(product.id, quantity + 1);
    }
    
    // Reset visual feedback after a delay
    setTimeout(() => {
      setAddingToInvoice(false);
    }, 300);
  };

  const handleDecreaseQuantity = () => {
    if (quantity > 0) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  // Stock status determination
  const getStockStatusColor = () => {
    if (product.stock <= 5) return 'text-red-600';
    if (product.stock <= 10) return 'text-amber-600';
    return 'text-green-600';
  };

  // Get appropriate badge color for category
  const getCategoryBadgeColor = () => {
    const category = product.category.toLowerCase();
    if (category.includes('spice')) return 'bg-amber-100 text-amber-800';
    if (category.includes('herb')) return 'bg-emerald-100 text-emerald-800';
    if (category.includes('ice') || category.includes('cream')) return 'bg-sky-100 text-sky-800';
    if (category.includes('vegetable')) return 'bg-green-100 text-green-800';
    if (category.includes('fruit')) return 'bg-red-100 text-red-800';
    if (category.includes('dairy')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative bg-white border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Stock status indicator (top bar) */}
      <div 
        className={`absolute top-0 left-0 right-0 h-1 ${
          product.stock <= 5 ? 'bg-red-500' : 
          product.stock <= 10 ? 'bg-amber-500' : 
          'bg-green-500'
        }`}
      />
      
      <div className="p-6">
        {/* Category badge */}
        <div className="mb-3">
          <span className={`inline-block px-2 py-1 text-xs font-medium ${getCategoryBadgeColor()} rounded-sm`}>
            {product.category}
          </span>
        </div>
        
        {/* Product name and price */}
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</p>
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-600 mr-1">Stock:</span>
              <span className={`text-sm font-bold ${getStockStatusColor()}`}>
                {product.stock}
              </span>
            </div>
          </div>
        </div>
        
        {/* Add to invoice button or quantity controls */}
        {quantity === 0 ? (
          <button 
            onClick={handleAddToInvoice}
            className={`mt-2 flex w-full items-center justify-center rounded-none ${
              isStockLimitReached 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : addingToInvoice
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
            } px-4 py-3 text-sm font-medium transition-colors`}
            disabled={isStockLimitReached}
          >
            <span className="material-icons text-sm mr-2">
              {addingToInvoice ? 'check_circle' : 'receipt'}
            </span>
            {isStockLimitReached 
              ? 'Out of Stock' 
              : addingToInvoice 
                ? 'Added!' 
                : 'Add to Invoice'
            }
          </button>
        ) : (
          <div className="pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center border border-gray-200">
                <button 
                  onClick={handleDecreaseQuantity}
                  className="px-3 py-1 hover:bg-gray-100 text-gray-900 font-medium"
                >
                  -
                </button>
                <span className={`px-4 py-1 font-medium text-gray-900 border-l border-r border-gray-200 ${
                  addingToInvoice ? 'bg-green-100' : ''
                } transition-colors duration-200`}>
                  {quantity}
                </span>
                <button 
                  onClick={handleIncreaseQuantity}
                  className={`px-3 py-1 ${
                    isStockLimitReached 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'hover:bg-gray-100 text-gray-900'
                  } font-medium`}
                  disabled={isStockLimitReached}
                >
                  +
                </button>
              </div>
              <span className={`font-medium ${
                addingToInvoice ? 'text-green-600' : 'text-gray-700'
              } transition-colors duration-200`}>
                ${(product.price * quantity).toFixed(2)}
              </span>
            </div>
            
            {/* Stock limit warning */}
            {isStockLimitReached && (
              <p className="mt-2 text-xs text-red-600 text-right">
                Stock limit reached
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 