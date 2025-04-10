'use client';

import React, { useEffect, useState } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '@/app/components/PageHeader';

export default function InvoicesPage() {
  const { 
    invoice, 
    updateQuantity, 
    removeItem, 
    clearInvoice, 
    totalItems, 
    subtotal, 
    creditsTotal,
    addCredit,
    removeCredit,
    updateCreditQuantity,
    getProductStock
  } = useInvoice();
  const router = useRouter();
  
  // State for credit form
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [creditName, setCreditName] = useState('');
  const [creditPrice, setCreditPrice] = useState('');
  const [creditQuantity, setCreditQuantity] = useState('1');
  
  // Check stock availability when page loads or items change
  useEffect(() => {
    // Only run this if we have items in the invoice
    if (invoice.items.length > 0) {
      console.log("Verifying stock for all invoice items using context...");
      
      const itemsWithLowStock: Array<{ name: string; original: number; adjusted: number }> = [];
      let adjustments = false;
      
      // Check each invoice item against current stock from CONTEXT
      invoice.items.forEach(item => {
        const currentStock = getProductStock(item.id); // Use context function
        
        // If item quantity exceeds available stock
        if (item.quantity > currentStock) {
          if (currentStock > 0) {
            // Adjust quantity to match available stock
            console.log(`Adjusting ${item.name} quantity from ${item.quantity} to ${currentStock}`);
            updateQuantity(item.id, currentStock);
            itemsWithLowStock.push({
              name: item.name, 
              original: item.quantity, 
              adjusted: currentStock
            });
            adjustments = true;
          } else {
            // If completely out of stock
            console.log(`Removing ${item.name} from invoice - out of stock`);
            removeItem(item.id);
            itemsWithLowStock.push({
              name: item.name, 
              original: item.quantity, 
              adjusted: 0
            });
            adjustments = true;
          }
        }
      });
      
      // Show notification if adjustments were made
      if (adjustments) {
        const message = itemsWithLowStock.map(item => 
          item.adjusted === 0 
            ? `${item.name}: Removed (out of stock)` 
            : `${item.name}: Reduced from ${item.original} to ${item.adjusted}`
        ).join('\n');
        
        // Use setTimeout to ensure alert happens after potential state updates settle
        setTimeout(() => {
            alert(`Some items in your invoice have been adjusted due to stock changes:\n\n${message}`);
        }, 0);
      }
    }
  // Ensure getProductStock is included if it could theoretically change, though unlikely
  }, [invoice.items, updateQuantity, removeItem, getProductStock]);
  
  const taxRate = 0.06;
  const tax = subtotal * taxRate;
  const deliveryFee = 3.99;
  const total = subtotal + tax + deliveryFee;

  const handleClearInvoice = () => {
    if (window.confirm('Are you sure you want to clear this invoice?')) {
      clearInvoice();
    }
  };

  const handleGenerateInvoice = () => {
    router.push('/checkout');
  };

  // Add a new credit
  const handleAddCredit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const price = parseFloat(creditPrice);
    const quantity = parseInt(creditQuantity);
    
    if (creditName.trim() === '') {
      alert('Please enter a credit description');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price greater than zero');
      return;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity greater than zero');
      return;
    }
    
    // Add the credit to the invoice
    addCredit({
      name: creditName,
      price: -price, // Make it negative to reduce the total
      quantity: quantity
    });
    
    // Reset form
    setCreditName('');
    setCreditPrice('');
    setCreditQuantity('1');
    setShowCreditForm(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Full-width header */}
      <PageHeader 
        title="CURRENT INVOICE" 
        fullWidth={true}
        withAction={
          invoice.items.length > 0 && (
            <Link 
              href="/search" 
              className="flex items-center text-gray-300 hover:text-white font-semibold transition-colors duration-150"
            >
              <span className="material-icons mr-1">add</span>
              <span>Add Items</span>
            </Link>
          )
        }
      />

      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-28 pt-2 flex-grow">
        {!invoice.restaurant ? (
          <div className="my-6 rounded-lg border border-gray-300 bg-white p-8 text-center shadow-md">
            <span className="material-icons mb-4 text-6xl text-gray-400">receipt_long</span>
            <h2 className="mb-4 text-2xl font-bold text-gray-800">No Active Invoice</h2>
            <p className="mb-8 text-gray-600">You need to select a restaurant first to create an invoice.</p>
            <Link 
              href="/restaurants" 
              className="inline-flex items-center justify-center rounded-md bg-gray-800 px-6 py-3 text-white hover:bg-gray-700"
            >
              <span className="material-icons mr-2">restaurant</span>
              Select Restaurant
            </Link>
          </div>
        ) : invoice.items.length === 0 ? (
          <div className="my-6 rounded-lg border border-gray-300 bg-white p-8 text-center shadow-md">
            <div className="mb-4 font-bold text-xl text-gray-800">{invoice.restaurant.name}</div>
            <div className="mb-4 text-gray-600">{invoice.restaurant.cuisine}</div>
            <span className="material-icons mb-4 text-6xl text-gray-400">receipt_long</span>
            <h2 className="mb-4 text-2xl font-bold text-gray-800">Empty Invoice</h2>
            <p className="mb-8 text-gray-600">Your invoice is empty. Add some items to your invoice.</p>
            <Link 
              href="/search" 
              className="inline-flex items-center justify-center rounded-md bg-gray-800 px-6 py-3 text-white hover:bg-gray-700"
            >
              <span className="material-icons mr-2">search</span>
              Browse Items
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-300 bg-white p-4 shadow-md sm:p-6">
            {/* Invoice Header */}
            <div className="mb-6 flex flex-col border-b border-gray-200 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {invoice.restaurant.name}
                </p>
                <p className="text-gray-700 font-medium">{invoice.restaurant.cuisine}</p>
              </div>
              <div className="mt-4 md:mt-0 md:text-right">
                <Link 
                  href="/search" 
                  className="inline-flex items-center text-gray-700 hover:text-gray-900"
                >
                  <span className="material-icons mr-1">add</span>
                  Add More Items
                </Link>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-bold text-gray-900">Invoice Items</h3>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="px-4 pb-3 text-sm font-bold text-gray-700 sm:pl-0">Item</th>
                      <th className="px-4 pb-3 text-sm font-bold text-gray-700">Qty</th>
                      <th className="px-4 pb-3 text-sm font-bold text-gray-700">Price</th>
                      <th className="px-4 pb-3 text-right text-sm font-bold text-gray-700 sm:pr-0">Total</th>
                      <th className="px-4 pb-3 text-right text-sm font-bold text-gray-700 sm:pr-0">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="px-4 py-3 sm:pl-0">
                          <p className="font-bold text-gray-900">{item.name}</p>
                          <p className="text-sm font-medium text-gray-700">{item.category}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center border border-gray-300 rounded-md w-24">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-1 hover:bg-gray-100 text-gray-900 font-bold"
                            >
                              -
                            </button>
                            <span className="px-3 font-medium text-gray-900">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-1 hover:bg-gray-100 text-gray-900 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-bold text-gray-900 sm:pr-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right sm:pr-0">
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <span className="material-icons">delete</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Credits Section */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Credits</h3>
                <button 
                  onClick={() => setShowCreditForm(!showCreditForm)}
                  className="flex items-center text-gray-700 hover:text-gray-900"
                >
                  <span className="material-icons mr-1">{showCreditForm ? 'close' : 'add'}</span>
                  {showCreditForm ? 'Cancel' : 'Add Credit'}
                </button>
              </div>
              
              {/* Credit Form */}
              {showCreditForm && (
                <div className="mb-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h4 className="text-md font-bold text-gray-900 mb-3">Add New Credit</h4>
                  <form onSubmit={handleAddCredit}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                      <div className="md:col-span-2">
                        <label htmlFor="creditName" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          id="creditName"
                          type="text"
                          value={creditName}
                          onChange={(e) => setCreditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
                          placeholder="e.g., Customer Discount"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="creditPrice" className="block text-sm font-medium text-gray-700 mb-1">
                          Amount ($)
                        </label>
                        <input
                          id="creditPrice"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={creditPrice}
                          onChange={(e) => setCreditPrice(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
                          placeholder="10.00"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="creditQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity
                        </label>
                        <input
                          id="creditQuantity"
                          type="number"
                          min="1"
                          value={creditQuantity}
                          onChange={(e) => setCreditQuantity(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400 text-black"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 focus:outline-none"
                      >
                        Add Credit
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              {/* Credit Items List */}
              {invoice.credits && invoice.credits.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 text-left">
                        <th className="px-4 pb-3 text-sm font-bold text-gray-700 sm:pl-0">Description</th>
                        <th className="px-4 pb-3 text-sm font-bold text-gray-700">Qty</th>
                        <th className="px-4 pb-3 text-sm font-bold text-gray-700">Amount</th>
                        <th className="px-4 pb-3 text-right text-sm font-bold text-gray-700 sm:pr-0">Total</th>
                        <th className="px-4 pb-3 text-right text-sm font-bold text-gray-700 sm:pr-0">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.credits.map((credit) => (
                        <tr key={credit.id} className="border-b border-gray-100">
                          <td className="px-4 py-3 sm:pl-0">
                            <p className="font-bold text-green-600">{credit.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center border border-gray-300 rounded-md w-24">
                              <button 
                                onClick={() => updateCreditQuantity(credit.id, credit.quantity - 1)}
                                className="px-3 py-1 hover:bg-gray-100 text-gray-900 font-bold"
                              >
                                -
                              </button>
                              <span className="px-3 font-medium text-gray-900">{credit.quantity}</span>
                              <button 
                                onClick={() => updateCreditQuantity(credit.id, credit.quantity + 1)}
                                className="px-3 py-1 hover:bg-gray-100 text-gray-900 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">${Math.abs(credit.price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right font-bold text-green-600 sm:pr-0">
                            -${Math.abs(credit.price * credit.quantity).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-right sm:pr-0">
                            <button 
                              onClick={() => removeCredit(credit.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <span className="material-icons">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 italic">No credits applied to this invoice.</p>
              )}
            </div>

            {/* Invoice Summary */}
            <div className="mb-6 border-b border-gray-200 pb-6">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Subtotal ({totalItems} items)</span>
                <span className="font-bold text-gray-900">${(subtotal - creditsTotal).toFixed(2)}</span>
              </div>
              
              {invoice.credits && invoice.credits.length > 0 && (
                <div className="mt-2 flex justify-between">
                  <span className="font-medium text-gray-700">Credits</span>
                  <span className="font-bold text-green-600">-${Math.abs(creditsTotal).toFixed(2)}</span>
                </div>
              )}
              
              <div className="mt-2 flex justify-between">
                <span className="font-medium text-gray-700">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="font-bold text-gray-900">${tax.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="font-medium text-gray-700">Delivery Fee</span>
                <span className="font-bold text-gray-900">${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="mt-4 flex justify-between text-lg font-bold">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse gap-4 md:flex-row md:justify-end">
              <button
                onClick={handleClearInvoice}
                className="rounded-md border border-gray-300 px-6 py-3 text-gray-800 hover:bg-gray-50 font-bold"
              >
                Clear Invoice
              </button>
              <button
                onClick={handleGenerateInvoice}
                className="flex items-center justify-center rounded-md bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 font-bold"
              >
                <span className="material-icons mr-2">receipt</span>
                Generate Invoice
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 