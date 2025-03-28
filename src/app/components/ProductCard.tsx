'use client';

import React from 'react';
import { useInvoice } from '../context/InvoiceContext';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, invoice, updateQuantity, removeItem } = useInvoice();
  
  // Find if this product is already in the invoice
  const invoiceItem = invoice.items.find(item => item.id === product.id);
  const quantity = invoiceItem ? invoiceItem.quantity : 0;

  const handleAddToInvoice = () => {
    // Check if a restaurant is selected
    if (!invoice.restaurant) {
      alert('Please select a restaurant first');
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <h3 className="text-lg font-bold text-gray-900">{product.name}</h3>
      <p className="text-md font-medium text-gray-700">{product.category}</p>
      <p className="mt-3 text-lg font-bold text-gray-900">${product.price.toFixed(2)}</p>
      
      {quantity === 0 ? (
        <button 
          onClick={handleAddToInvoice}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-md bg-blue-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto"
        >
          <span className="material-icons text-sm">receipt</span>
          Add to Invoice
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
              className="px-3 py-1 hover:bg-gray-100 text-gray-900 font-bold"
            >
              +
            </button>
          </div>
          <span className="font-medium text-gray-700">
            Total: ${(product.price * quantity).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
} 