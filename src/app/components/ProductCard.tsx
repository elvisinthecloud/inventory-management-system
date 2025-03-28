'use client';

import React from 'react';
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

    // Add item to invoice
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category
    });
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
      <p className="text-md font-medium text-gray-700">{product.category}</p>
      
      {/* Display stock information */}
      <div className="mt-2 flex items-center">
        <span className="text-sm font-medium text-gray-600">Stock: </span>
        <span className={`ml-1 text-sm font-bold ${getStockStatusColor()}`}>
          {product.stock}
        </span>
      </div>
      
      <p className="mt-2 text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
      
      {quantity === 0 ? (
        <button 
          onClick={handleAddToInvoice}
          className={`mt-4 flex w-full items-center justify-center gap-1 rounded-md ${
            isStockLimitReached 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } px-4 py-3 text-base font-semibold text-white transition-colors sm:w-auto`}
          disabled={isStockLimitReached}
        >
          <span className="material-icons text-sm">receipt</span>
          {isStockLimitReached ? 'Out of Stock' : 'Add to Invoice'}
        </button>
      ) : (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button 
              onClick={handleDecreaseQuantity}
              className="px-3 py-1 hover:bg-gray-100 text-gray-900 font-bold"
            >
              -
            </button>
            <span className="px-4 font-medium text-gray-900">{quantity}</span>
            <button 
              onClick={handleIncreaseQuantity}
              className={`px-3 py-1 ${
                isStockLimitReached 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'hover:bg-gray-100 text-gray-900'
              } font-bold`}
              disabled={isStockLimitReached}
            >
              +
            </button>
          </div>
          <span className="font-medium text-gray-700">
            Total: ${(product.price * quantity).toFixed(2)}
          </span>
        </div>
      )}

      {/* Show a message if quantity is at stock limit */}
      {quantity > 0 && isStockLimitReached && (
        <p className="mt-2 text-xs text-red-600 text-right">
          Stock limit reached
        </p>
      )}
    </div>
  );
} 