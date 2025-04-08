'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoice } from '../context/InvoiceContext';
import { Roboto_Mono } from "next/font/google";
import Link from 'next/link';
import PageHeader from '@/app/components/PageHeader';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

export default function CheckoutPage() {
  const { invoice, clearInvoice, totalItems, subtotal, creditsTotal, saveInvoiceToHistory, updateProductStock } = useInvoice();
  const router = useRouter();
  const [orderId, setOrderId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [isInvoiceGenerated, setIsInvoiceGenerated] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  // Animation states
  const [isConfirming, setIsConfirming] = useState(false);
  const [showConfirmationEffect, setShowConfirmationEffect] = useState(false);

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
    // Start animation
    setIsConfirming(true);
    
    // Show confirmation effect
    setTimeout(() => {
      setShowConfirmationEffect(true);
    }, 300);
    
    // Wait for animation to complete before actual generation
    setTimeout(() => {
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
            
            setIsConfirming(false);
            setShowConfirmationEffect(false);
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
          credits: invoice.credits,
          subtotal,
          tax,
          deliveryFee,
          total
        });
        console.log(`Invoice ${orderId} saved to history`);
      }
      
      // Reset animation states after completion
      setIsConfirming(false);
      setShowConfirmationEffect(false);
    }, 1700); // Extended from 1200 to 1700 (added 500ms)
  };

  const handleDownloadPDF = () => {
    // Import jsPDF with proper type definition
    import('jspdf').then(({ default: jsPDF }) => {
      // Import autoTable dynamically
      import('jspdf-autotable').then((jsPDFAutoTable) => {
        // Create document
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15; // Standard margin
        
        // Add a clean white background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, pageHeight, 'F');
        
        // Add a professional header bar
        doc.setFillColor(16, 50, 120); // Deep professional blue
        doc.rect(0, 0, pageWidth, 35, 'F'); // Reduced height from 40 to 35
        
        // Add main title - Elite-Prod
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Elite-Prod', margin, 18); // Adjusted y position from 20 to 18
        
        // Add subtitle inside the header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Elite Products LLC', margin, 28); // Adjusted y position from 30 to 28
        
        // Add invoice title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text('INVOICE', pageWidth - margin, 18, { align: 'right' }); // Adjusted y position from 20 to 18
        
        // Generate unique invoice ID
        const invoiceId = Math.random().toString(36).substring(2, 10).toUpperCase();
        
        // Format current date as month/day/year
        const formattedDate = (() => {
          const date = new Date();
          const day = date.getDate();
          const month = date.toLocaleString('en-US', { month: 'long' });
          const year = date.getFullYear();
          return `${month}/${day}/${year}`;
        })();
        
        // Add invoice number
        doc.setFontSize(10);
        doc.text(`#${invoiceId}`, pageWidth - margin, 28, { align: 'right' }); // Adjusted y position from 30 to 28
        
        // Invoice metadata section
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, 50, pageWidth - (margin * 2), 30, 'FD');
        
        // Add invoice metadata
        doc.setFontSize(11); // Increased from 9
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('INVOICE DATE:', margin + 6, 60);
        doc.text('RESTAURANT:', margin + 6, 70);
        doc.text('CUISINE:', pageWidth / 2, 70);
        
        // Add invoice metadata values
        doc.setFont('helvetica', 'bold'); // Changed from 'normal' to 'bold'
        doc.setFontSize(11); // Increased from default
        doc.setTextColor(60, 60, 60);
        doc.text(formattedDate, margin + 50, 60);
        doc.text(invoice.restaurant?.name || 'N/A', margin + 50, 70);
        doc.text(invoice.restaurant?.cuisine || 'N/A', pageWidth / 2 + 30, 70);
        
        // Add a light gray separator line
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(margin, 88, pageWidth - margin, 88);
        
        // Calculate content height based on items - use smaller height per item
        const itemCount = invoice.items.length;
        const creditCount = invoice.credits?.length || 0;
        const itemHeight = 9; // Reduced height per item row (was 12)
        const itemSpacing = 1; // Additional spacing between items
        
        // ORDER ITEMS SECTION
        doc.setFillColor(16, 50, 120); // Deep professional blue
        doc.rect(margin, 95, pageWidth - (margin * 2), 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('ORDER ITEMS', margin + 5, 102);
        
        // Table header
        const yPos = 112; // Slightly reduced from 115
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        
        // Adjusted column positions for better alignment
        const colItem = margin + 5;
        const colCategory = margin + 75;
        const colPrice = margin + 120;
        const colQty = margin + 145;
        const colTotal = margin + 160;
        
        // Column headers with clean underline
        doc.text('Item', colItem, yPos);
        doc.text('Category', colCategory, yPos);
        doc.text('Price', colPrice, yPos);
        doc.text('Qty', colQty, yPos);
        doc.text('Total', colTotal, yPos);
        
        // Header underline
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPos + 4, pageWidth - margin, yPos + 4);
        
        // Add table content
        let contentYPos = yPos + 10; // Reduced from +12
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8); // Reduced from 9
        doc.setTextColor(60, 60, 60);
        
        // Add alternating row backgrounds
        let isAlternate = false;
        
        // Determine maximum items to show - more generous limit now with compact design
        const maxItemsToShow = Math.min(
          invoice.items.length,
          25 // Increased from 20
        );
        
        for (let i = 0; i < maxItemsToShow; i++) {
          const item = invoice.items[i];
          
          if (isAlternate) {
            doc.setFillColor(245, 245, 250);
            doc.rect(margin, contentYPos - 5, pageWidth - (margin * 2), 8, 'F'); // Reduced height
          }
          
          // Truncate item name if too long
          const itemName = item.name.length > 25 ? item.name.substring(0, 22) + '...' : item.name;
          const catName = item.category.length > 15 ? item.category.substring(0, 12) + '...' : item.category;
          
          doc.text(itemName, colItem, contentYPos);
          doc.text(catName, colCategory, contentYPos);
          doc.text(`$${item.price.toFixed(2)}`, colPrice, contentYPos);
          doc.text(item.quantity.toString(), colQty, contentYPos);
          doc.text(`$${(item.price * item.quantity).toFixed(2)}`, colTotal, contentYPos);
          
          contentYPos += itemHeight + itemSpacing;
          isAlternate = !isAlternate;
          
          // Check if we're approaching the bottom of the page
          if (contentYPos > pageHeight - 75) {
            break;
          }
        }
        
        // If we had to truncate items, add an indicator
        if (invoice.items.length > maxItemsToShow) {
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(100, 100, 100);
          doc.text(`+ ${invoice.items.length - maxItemsToShow} more items`, margin + 5, contentYPos);
          contentYPos += 8; // Reduced from 12
        }
        
        // End of items section with a line
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, contentYPos, pageWidth - margin, contentYPos);
        contentYPos += 10; // Reduced from 15
        
        // Add credits if there are any
        if (invoice.credits && invoice.credits.length > 0) {
          // Credits header - only 65% of page width instead of full width
          const creditsWidth = (pageWidth - (margin * 2)) * 0.65; // 65% of content width
          doc.setFillColor(80, 130, 50); // Professional green
          doc.rect(margin, contentYPos, creditsWidth, 10, 'F'); // Only spans 65% of width
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('CREDITS', margin + 5, contentYPos + 7);
          contentYPos += 15; // Reduced from 20
          
          // Credit headers
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.setTextColor(80, 80, 80);
          
          // Column headers for credits
          doc.text('Description', colItem, contentYPos);
          doc.text('Amount', colPrice, contentYPos);
          doc.text('Qty', colQty, contentYPos);
          doc.text('Total', colTotal, contentYPos);
          
          // Header underline - only extends to the credit section width
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, contentYPos + 4, margin + creditsWidth, contentYPos + 4);
          contentYPos += 10; // Reduced from 12
          
          // Credits content
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8); // Reduced from 9
          isAlternate = false;
          
          // Calculate max credits to show
          const maxCreditsToShow = Math.min(
            invoice.credits.length,
            10 // Reasonable max
          );
          
          for (let i = 0; i < maxCreditsToShow; i++) {
            const credit = invoice.credits[i];
            
            if (isAlternate) {
              doc.setFillColor(245, 245, 250);
              doc.rect(margin, contentYPos - 5, creditsWidth, 8, 'F'); // Match width of header
            }
            
            // Truncate description if too long
            const creditName = credit.name.length > 30 ? credit.name.substring(0, 27) + '...' : credit.name;
            
            doc.setTextColor(60, 60, 60);
            doc.text(creditName, colItem, contentYPos);
            doc.text(`$${Math.abs(credit.price).toFixed(2)}`, colPrice, contentYPos);
            doc.text(credit.quantity.toString(), colQty, contentYPos);
            doc.setTextColor(80, 130, 50); // Green for credit amounts
            doc.text(`-$${Math.abs(credit.price * credit.quantity).toFixed(2)}`, colTotal, contentYPos);
            
            contentYPos += itemHeight + itemSpacing;
            isAlternate = !isAlternate;
            
            // Check if we're approaching the bottom of the page
            if (contentYPos > pageHeight - 75) {
              break;
            }
          }
          
          // If we had to truncate credits, add an indicator
          if (invoice.credits.length > maxCreditsToShow) {
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(100, 100, 100);
            doc.text(`+ ${invoice.credits.length - maxCreditsToShow} more credits`, colItem, contentYPos);
            contentYPos += 8; // Reduced from 12
          }
          
          // End of credits section with a line - only extends to the credit section width
          doc.setDrawColor(220, 220, 220);
          doc.line(margin, contentYPos, margin + creditsWidth, contentYPos);
          contentYPos += 10; // Reduced from 15
        }
        
        // SUMMARY SECTION (always shown at the bottom)
        const footerY = pageHeight - 20;
        const footerLineY = footerY - 5;
        const summaryBoxHeight = 50; // Slightly reduced height
        const minSpaceBetweenSummaryAndFooter = 15; // Minimum space between summary box and footer line
        
        // Calculate summary Y position to avoid footer overlap
        const maxSummaryY = footerLineY - summaryBoxHeight - minSpaceBetweenSummaryAndFooter;
        
        // Ensure summary box doesn't overlap with content - add buffer space
        const bufferSpace = 10; // Buffer space between content and summary
        const summaryY = Math.min(contentYPos + bufferSpace, maxSummaryY);
        
        // Summary box - light gray background
        doc.setFillColor(248, 249, 250);
        doc.rect(pageWidth / 2, summaryY, pageWidth / 2 - margin, summaryBoxHeight, 'F');
        
        // Add summary items
        const summaryStartX = pageWidth / 2 + 5;
        const valueX = pageWidth - margin - 5;
        let summaryItemY = summaryY + 10; // Reduced from 12
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Subtotal:', summaryStartX, summaryItemY);
        doc.text(`$${subtotal.toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
        
        // If there are credits, show them in the summary
        if (invoice.credits && invoice.credits.length > 0) {
          summaryItemY += 9; // Reduced from 10
          doc.setTextColor(80, 130, 50); // Green for credit amounts
          doc.text('Credits:', summaryStartX, summaryItemY);
          doc.text(`-$${Math.abs(creditsTotal).toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
          doc.setTextColor(80, 80, 80); // Reset to gray
        }
        
        summaryItemY += 9; // Reduced from 10
        doc.text('Tax (6%):', summaryStartX, summaryItemY);
        doc.text(`$${tax.toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
        
        summaryItemY += 9; // Reduced from 10
        doc.text('Delivery Fee:', summaryStartX, summaryItemY);
        doc.text(`$${deliveryFee.toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
        
        // Total with stronger emphasis
        summaryItemY += 5; // Reduced from 6
        doc.setDrawColor(180, 180, 180);
        doc.line(summaryStartX, summaryItemY, valueX, summaryItemY);
        
        summaryItemY += 8; // Reduced from 10
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10); // Reduced from 11
        doc.setTextColor(16, 50, 120); // Match header blue
        doc.text('TOTAL:', summaryStartX, summaryItemY);
        doc.text(`$${total.toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
        
        // Add footer
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, footerLineY, pageWidth - margin, footerLineY);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text('Thank you for your business', pageWidth / 2, footerY, { align: 'center' });
        doc.text(`Generated on ${formattedDate}`, pageWidth / 2, footerY + 6, { align: 'center' });
        
        // Create a unique filename for the invoice
        const filename = `Invoice_${invoice.restaurant?.name.replace(/\s+/g, '_')}_${invoiceId}.pdf`;
        
        // Save the PDF
        doc.save(filename);
        
        // If everything went well, save this invoice to history
        if (invoice.restaurant) {
          saveInvoiceToHistory({
            id: invoiceId,
            date: formattedDate,
            restaurant: invoice.restaurant,
            items: invoice.items,
            credits: invoice.credits || [],
            subtotal: subtotal,
            tax: tax,
            deliveryFee: deliveryFee,
            total: total
          });
        }
        
        // Display success notification
        setShowSuccessNotification(true);
        
        // Hide notification after 3 seconds
        setTimeout(() => {
          setShowSuccessNotification(false);
        }, 3000);
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Full-width header */}
      <PageHeader 
        title={isInvoiceGenerated ? 'INVOICE' : 'FINALIZE INVOICE'}
        fullWidth={true}
        withAction={
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
        }
      />

      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-28 pt-2 flex-grow">
        {/* Success overlay for confirmation animation */}
        {showConfirmationEffect && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 animate-fadeIn">
            <div className="relative bg-white rounded-full p-8 animate-smooth-bounce animate-sparkle">
              <div className="confirmation-ring">
                <div className="confirmation-ring-spinner animate-spin"></div>
                <span className="material-icons text-green-500 text-5xl checkmark-icon animate-checkmark-appear">
                  check
                </span>
              </div>
            </div>
          </div>
        )}
        
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
                  disabled={isConfirming}
                  className={`flex items-center justify-center rounded-md px-6 py-3 text-white font-bold transition-all duration-300 ${
                    isConfirming 
                      ? 'bg-green-600 transform scale-105'
                      : 'bg-gray-800 hover:bg-gray-700 hover:scale-[1.02]'
                  }`}
                >
                  <span className="material-icons mr-2">
                    {isConfirming ? "hourglass_top" : "receipt"}
                  </span>
                  {isConfirming ? "Processing..." : "Confirm Invoice"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success notification */}
      {showSuccessNotification && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg animate-slideInUp">
          <div className="flex items-center">
            <span className="material-icons mr-2">check_circle</span>
            <p>PDF downloaded successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
} 