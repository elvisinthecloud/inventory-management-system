'use client';

import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { Roboto_Mono } from "next/font/google";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageHeader from '@/app/components/PageHeader';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

export default function InvoicesPage() {
  const { invoice, updateQuantity, removeItem, clearInvoice, totalItems, subtotal } = useInvoice();
  const router = useRouter();
  
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

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-20 pt-6">
      <PageHeader title="CURRENT INVOICE" />

      {!invoice.restaurant ? (
        <div className="my-12 rounded-lg border border-gray-300 bg-white p-8 text-center shadow-md">
          <span className="material-icons mb-4 text-6xl text-gray-400">receipt_long</span>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">No Active Invoice</h2>
          <p className="mb-8 text-gray-600">You need to select a restaurant first to create an invoice.</p>
          <Link 
            href="/restaurants" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            <span className="material-icons mr-2">restaurant</span>
            Select Restaurant
          </Link>
        </div>
      ) : invoice.items.length === 0 ? (
        <div className="my-12 rounded-lg border border-gray-300 bg-white p-8 text-center shadow-md">
          <div className="mb-4 font-bold text-xl text-gray-800">{invoice.restaurant.name}</div>
          <div className="mb-4 text-gray-600">{invoice.restaurant.cuisine}</div>
          <span className="material-icons mb-4 text-6xl text-gray-400">receipt_long</span>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Empty Invoice</h2>
          <p className="mb-8 text-gray-600">Your invoice is empty. Add some items to your invoice.</p>
          <Link 
            href="/search" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
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
                className="inline-flex items-center text-blue-600 hover:text-blue-800"
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

          {/* Invoice Summary */}
          <div className="mb-6 border-b border-gray-200 pb-6">
            <div className="flex justify-between">
              <span className="font-medium text-gray-700">Subtotal ({totalItems} items)</span>
              <span className="font-bold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
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
              className="flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 font-bold"
            >
              <span className="material-icons mr-2">receipt</span>
              Generate Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 