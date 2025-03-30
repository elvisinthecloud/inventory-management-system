'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoice } from '../context/InvoiceContext';
import { Roboto_Mono } from "next/font/google";
import Link from 'next/link';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

export default function CheckoutPage() {
  const { invoice, clearInvoice, totalItems, subtotal, saveInvoiceToHistory, updateProductStock } = useInvoice();
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);

  // Check if invoice is empty or no restaurant selected, redirect to home if so
  useEffect(() => {
    if (!invoice.restaurant || invoice.items.length === 0) {
      router.push('/restaurants');
      return;
    }

    // Verify if all items in the invoice are still in stock
    const verifyStock = () => {
      const productsJson = localStorage.getItem('products');
      if (productsJson) {
        const products = JSON.parse(productsJson);
        
        // Check each invoice item against current stock
        let insufficientStock = false;
        let outOfStockItems = [];

        for (const item of invoice.items) {
          const product = products.find((p: { id: number }) => p.id === item.id);
          if (product) {
            // If current stock is less than quantity in invoice
            if (product.stock < item.quantity) {
              insufficientStock = true;
              outOfStockItems.push({
                name: item.name,
                requested: item.quantity,
                available: product.stock
              });
            }
          }
        }
        
        // If any items are out of stock, show warning and reset invoice
        if (insufficientStock) {
          const message = outOfStockItems.map(item => 
            `${item.name}: Requested ${item.requested}, only ${item.available} available`
          ).join('\n');
          
          alert(`Some items in your invoice are no longer available:\n${message}\n\nYou will be redirected to the restaurants page.`);
          clearInvoice();
          router.push('/restaurants');
        }
      }
    };

    // Verify stock when component mounts
    if (!isInvoiceGenerated) {
      verifyStock();
    }
  }, [invoice.restaurant, invoice.items, router, clearInvoice, isInvoiceGenerated]);

  // Generate order ID and date
  useEffect(() => {
    setOrderId(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
    const date = new Date();
    setOrderDate(date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const taxRate = 0.06;
  const tax = subtotal * taxRate;
  const deliveryFee = 3.99;
  const total = subtotal + tax + deliveryFee;

  const handleGenerateInvoice = () => {
    // Check if all items are still in stock
    if (invoice.restaurant && invoice.items.length > 0) {
      // Get current products from localStorage
      const productsJson = localStorage.getItem('products');
      if (productsJson) {
        const products = JSON.parse(productsJson);
        
        // Check each invoice item against current stock
        let insufficientStock = false;
        let outOfStockItems = [];

        for (const item of invoice.items) {
          const product = products.find((p: { id: number }) => p.id === item.id);
          if (product) {
            // If current stock is less than quantity in invoice
            if (product.stock < item.quantity) {
              insufficientStock = true;
              outOfStockItems.push({
                name: item.name,
                requested: item.quantity,
                available: product.stock
              });
            }
          }
        }
        
        // If any items are out of stock, show error and don't proceed
        if (insufficientStock) {
          const message = outOfStockItems.map(item => 
            `${item.name}: Requested ${item.requested}, only ${item.available} available`
          ).join('\n');
          
          alert(`Cannot generate invoice due to insufficient stock:\n${message}`);
          return;
        }
      }
    }
    
    // First, update stock for all items in the invoice
    if (invoice.restaurant && invoice.items.length > 0) {
      // Get current products from localStorage
      const productsJson = localStorage.getItem('products');
      if (productsJson) {
        let products = JSON.parse(productsJson);
        let stockUpdated = false;
        
        console.log("Processing invoice for stock updates...");
        
        // Process each invoice item and update stock
        invoice.items.forEach(item => {
          const productIndex = products.findIndex((p: { id: number }) => p.id === item.id);
          if (productIndex >= 0) {
            // Get current stock
            const currentStock = products[productIndex].stock;
            
            // Calculate new stock (don't let it go below 0)
            const newStock = Math.max(0, currentStock - item.quantity);
            
            console.log(`Invoice item: ${item.name} (ID: ${item.id})`);
            console.log(`  Stock before: ${currentStock}`);
            console.log(`  Quantity in invoice: ${item.quantity}`);
            console.log(`  Stock after: ${newStock}`);
            
            // Update product stock in both arrays
            products[productIndex].stock = newStock;
            stockUpdated = true;
            
            // Also update in InvoiceContext
            updateProductStock(item.id, newStock);
          } else {
            console.warn(`Product with ID ${item.id} not found in products array`);
          }
        });
        
        // Save updated products back to localStorage
        if (stockUpdated) {
          localStorage.setItem('products', JSON.stringify(products));
          console.log("✅ Stock updated in localStorage after invoice confirmation");
        }
      } else {
        console.warn("No products found in localStorage when processing invoice");
      }
    }
    
    // Then proceed with invoice confirmation
    setIsInvoiceGenerated(true);
    
    // Save to invoice history
    if (invoice.restaurant) {
      saveInvoiceToHistory({
        id: orderId,
        date: orderDate,
        restaurant: invoice.restaurant,
        items: invoice.items,
        subtotal,
        tax,
        deliveryFee,
        total
      });
      console.log(`Invoice ${orderId} saved to history`);
    }
  };

  const handleDownloadPDF = () => {
    // Import jsPDF with proper type definition
    import('jspdf').then(({ default: jsPDF }) => {
      // Import autoTable dynamically
      import('jspdf-autotable').then((jsPDFAutoTable) => {
        // Create document
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 80);
        doc.text('INVOICE', 105, 15, { align: 'center' });
        
        // Add invoice details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Invoice #: ${orderId}`, 14, 30);
        doc.text(`Date: ${orderDate}`, 14, 37);
        doc.text(`Restaurant: ${invoice.restaurant?.name}`, 14, 44);
        doc.text(`Cuisine: ${invoice.restaurant?.cuisine}`, 14, 51);

        // Add items table
        const tableColumn = ["Item", "Category", "Price", "Quantity", "Total"];
        const tableRows = invoice.items.map(item => [
          item.name,
          item.category,
          `$${item.price.toFixed(2)}`,
          item.quantity,
          `$${(item.price * item.quantity).toFixed(2)}`
        ]);

        // Use autoTable directly
        jsPDFAutoTable.default(doc, {
          startY: 60,
          head: [tableColumn],
          body: tableRows,
          theme: 'striped',
          headStyles: {
            fillColor: [66, 139, 202],
            textColor: 255,
            fontStyle: 'bold'
          },
          margin: { top: 10 }
        });
        
        // Add summary - need to get finalY from lastAutoTable
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text(`Subtotal: $${subtotal.toFixed(2)}`, 140, finalY);
        doc.text(`Tax (${(taxRate * 100).toFixed(0)}%): $${tax.toFixed(2)}`, 140, finalY + 7);
        doc.text(`Delivery Fee: $${deliveryFee.toFixed(2)}`, 140, finalY + 14);
        doc.text(`Total: $${total.toFixed(2)}`, 140, finalY + 21);
        
        // Save the PDF
        doc.save(`Invoice_${orderId}.pdf`);
      });
    });
  };

  const handleNewInvoice = () => {
    // Clear the invoice from context
    clearInvoice();
    
    // Also clear isInvoiceGenerated state
    setIsInvoiceGenerated(false);
    
    // Reset order ID and date
    setOrderId(`INV-${Math.floor(100000 + Math.random() * 900000)}`);
    const date = new Date();
    setOrderDate(date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
    
    // Redirect to restaurants page
    router.push('/restaurants');
  };

  // If no restaurant selected or invoice is empty, don't render anything (redirection will happen)
  if (!invoice.restaurant || invoice.items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-20 pt-6">
      <div className="mb-8">
        <div className="bg-gray-800 px-6 py-4 shadow-md">
          <div className="flex items-center justify-between">
            <h1 className={`${robotoMono.className} text-2xl uppercase tracking-wide text-white border-l-4 border-gray-500 pl-4`}>
              {isInvoiceGenerated ? 'INVOICE' : 'FINALIZE INVOICE'}
            </h1>
            <div className="flex items-center space-x-2">
              {!isInvoiceGenerated && (
                <Link 
                  href="/search" 
                  className="flex items-center text-gray-300 hover:text-white"
                >
                  <span className="material-icons mr-1">add</span>
                  <span className="hidden sm:inline">Add More Items</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              )}
              <Link 
                href="/history" 
                className="flex items-center rounded-md bg-gray-700 px-3 py-2 text-gray-200 hover:bg-gray-600"
              >
                <span className="material-icons mr-1">history</span>
                <span className="hidden sm:inline">Invoice History</span>
                <span className="sm:hidden">History</span>
              </Link>
            </div>
          </div>
        </div>
        {/* Subtle divider line */}
        <div className="h-1 bg-gradient-to-r from-gray-700 to-gray-600"></div>
      </div>

      {/* Invoice Summary */}
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
            <p className="text-sm font-medium text-gray-700">Invoice #: <span className="font-bold">{orderId}</span></p>
            <p className="text-sm font-medium text-gray-700">Date: <span className="font-bold">{orderDate}</span></p>
            <p className="mt-2 text-sm font-bold text-gray-900">
              Status: {isInvoiceGenerated ? 'Confirmed' : 'Pending'}
            </p>
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
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 sm:pl-0">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm font-medium text-gray-700">{item.category}</p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.quantity}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">${item.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 sm:pr-0">
                      ${(item.price * item.quantity).toFixed(2)}
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
          {isInvoiceGenerated ? (
            <>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center rounded-md bg-gray-700 px-6 py-3 text-white hover:bg-gray-600 font-bold"
              >
                <span className="material-icons mr-2">download</span>
                Download PDF
              </button>
              <button
                onClick={handleNewInvoice}
                className="flex items-center justify-center rounded-md bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 font-bold"
              >
                <span className="material-icons mr-2">add_circle</span>
                Create New Invoice
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.back()}
                className="rounded-md border border-gray-300 px-6 py-3 text-gray-800 hover:bg-gray-50 font-bold"
              >
                Back
              </button>
              <button
                onClick={handleGenerateInvoice}
                className="flex items-center justify-center rounded-md bg-gray-800 px-6 py-3 text-white hover:bg-gray-700 font-bold"
              >
                <span className="material-icons mr-2">receipt</span>
                Confirm Invoice
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 