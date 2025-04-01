'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { Roboto_Mono } from "next/font/google";
import Link from 'next/link';
import PageHeader from '@/app/components/PageHeader';
import { useSearchParams } from 'next/navigation';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

// ClientOnly component to prevent hydration errors
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export default function HistoryPage() {
  const { invoiceHistory } = useInvoice();
  // Create refs object to hold references to each invoice card
  const invoiceRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Effect for handling scroll to invoice ID from URL hash
  useEffect(() => {
    // Get the hash from the URL
    const hash = window.location.hash;
    if (hash) {
      // Remove the # prefix to get the invoice ID
      const invoiceId = hash.substring(1);
      
      // Slight delay to ensure the DOM is ready
      setTimeout(() => {
        // Get the element using the ref
        const element = invoiceRefs.current[invoiceId];
        
        if (element) {
          // Scroll the element into view with smooth behavior
          element.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
          
          // Add highlighting animation for visual feedback
          element.classList.add('highlighted-invoice');
          
          // Remove the highlight class after animation completes
          setTimeout(() => {
            element.classList.remove('highlighted-invoice');
            // Keep a subtle highlight to maintain awareness
            element.classList.add('soft-highlight');
          }, 3000);
        }
      }, 100);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownloadPDF = (invoice: any) => {
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
        doc.rect(0, 0, pageWidth, 40, 'F'); // Square header
        
        // Add main title - Elite-Prod
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Elite-Prod', margin, 20);
        
        // Add subtitle inside the header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Elite Products LLC', margin, 30);
        
        // Add invoice title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text('INVOICE', pageWidth - margin, 20, { align: 'right' });
        
        // Add invoice number
        doc.setFontSize(10);
        doc.text(`#${invoice.id}`, pageWidth - margin, 30, { align: 'right' });
        
        // Invoice metadata section
        doc.setDrawColor(230, 230, 230);
        doc.setFillColor(248, 249, 250);
        doc.rect(margin, 50, pageWidth - (margin * 2), 30, 'FD');
        
        // Add invoice metadata
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(80, 80, 80);
        doc.text('INVOICE DATE:', margin + 6, 60);
        doc.text('RESTAURANT:', margin + 6, 70);
        doc.text('CUISINE:', pageWidth / 2, 70);
        
        // Add invoice metadata values
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        doc.text(invoice.date, margin + 50, 60);
        doc.text(invoice.restaurant.name, margin + 50, 70);
        doc.text(invoice.restaurant.cuisine, pageWidth / 2 + 30, 70);
        
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
        const colTotal = margin + 170;
        
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
          // Credits header
          doc.setFillColor(80, 130, 50); // Professional green
          doc.rect(margin, contentYPos, pageWidth - (margin * 2), 10, 'F');
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
          
          // Header underline
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, contentYPos + 4, pageWidth - margin, contentYPos + 4);
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
              doc.rect(margin, contentYPos - 5, pageWidth - (margin * 2), 8, 'F'); // Reduced height
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
          
          // End of credits section with a line
          doc.setDrawColor(220, 220, 220);
          doc.line(margin, contentYPos, pageWidth - margin, contentYPos);
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
        doc.text(`$${invoice.subtotal.toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
        
        // If there are credits, show them in the summary
        if (invoice.credits && invoice.credits.length > 0) {
          const creditsTotal = invoice.credits.reduce(
            (total: number, credit: any) => total + (credit.price * credit.quantity), 
            0
          );
          
          if (creditsTotal !== 0) {
            summaryItemY += 9; // Reduced from 10
            doc.setTextColor(80, 130, 50); // Green for credit amounts
            doc.text('Credits:', summaryStartX, summaryItemY);
            doc.text(`-$${Math.abs(creditsTotal).toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
            doc.setTextColor(80, 80, 80); // Reset to gray
          }
        }
        
        summaryItemY += 9; // Reduced from 10
        doc.text('Tax (6%):', summaryStartX, summaryItemY);
        doc.text(`$${invoice.tax.toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
        
        summaryItemY += 9; // Reduced from 10
        doc.text('Delivery Fee:', summaryStartX, summaryItemY);
        doc.text(`$${invoice.deliveryFee.toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
        
        // Total with stronger emphasis
        summaryItemY += 5; // Reduced from 6
        doc.setDrawColor(180, 180, 180);
        doc.line(summaryStartX, summaryItemY, valueX, summaryItemY);
        
        summaryItemY += 8; // Reduced from 10
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10); // Reduced from 11
        doc.setTextColor(16, 50, 120); // Match header blue
        doc.text('TOTAL:', summaryStartX, summaryItemY);
        doc.text(`$${invoice.total.toFixed(2)}`, valueX, summaryItemY, { align: 'right' });
        
        // Add footer
        doc.setLineWidth(0.5);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, footerLineY, pageWidth - margin, footerLineY);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text('Thank you for your business', pageWidth / 2, footerY, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 6, { align: 'center' });
        
        // Save the PDF
        doc.save(`Invoice_${invoice.id}.pdf`);
      });
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <style jsx global>{`
        @keyframes pulse-border {
          0% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }
        .highlighted-invoice {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
          animation: pulse-border 2s ease-in-out 3;
          border-color: #3b82f6;
          background-color: #eff6ff;
        }
        .soft-highlight {
          box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
          border-color: #93c5fd;
        }
      `}</style>

      {/* Full-width header */}
      <PageHeader 
        title="INVOICE HISTORY" 
        fullWidth={true}
        withAction={
          <Link 
            href="/restaurants" 
            className="flex items-center text-gray-300 hover:text-white font-semibold transition-colors duration-150"
          >
            <span className="material-icons mr-1">add</span>
            <span>New Invoice</span>
          </Link>
        }
      />

      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-28 pt-2 flex-grow">
        <ClientOnly>
          {invoiceHistory.length === 0 ? (
            <div className="my-6 rounded-lg border border-gray-300 bg-white p-8 text-center shadow-md">
              <span className="material-icons mb-4 text-6xl text-gray-400">history</span>
              <h2 className="mb-4 text-2xl font-bold text-gray-800">No Invoice History</h2>
              <p className="mb-8 text-gray-600">You haven't created any invoices yet.</p>
              <Link 
                href="/restaurants" 
                className="inline-flex items-center justify-center rounded-md bg-gray-800 px-6 py-3 text-white hover:bg-gray-700"
              >
                <span className="material-icons mr-2">add_circle</span>
                Create New Invoice
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
              {invoiceHistory.map((invoice, index) => (
                <div 
                  key={`${invoice.id}-${index}`}
                  id={invoice.id} // Add an ID attribute for the fragment navigation
                  ref={el => {
                    invoiceRefs.current[invoice.id] = el;
                  }} // Add ref for programmatic scrolling
                  className="rounded-lg border border-gray-300 bg-white p-4 shadow-md sm:p-6 transition-all duration-300 hover:shadow-lg hover:border-blue-300"
                >
                  <div className="mb-4 flex justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Invoice #{invoice.id}</h3>
                      <p className="text-sm text-gray-600">{formatDate(invoice.date)}</p>
                    </div>
                    <button
                      onClick={() => handleDownloadPDF(invoice)}
                      className="flex items-center rounded-md bg-gray-800 px-3 py-1 text-white hover:bg-gray-700"
                    >
                      <span className="material-icons mr-1">download</span>
                      <span>PDF</span>
                    </button>
                  </div>
                  
                  <div className="mb-3">
                    <h4 className="text-md font-bold text-gray-900">{invoice.restaurant.name}</h4>
                    <p className="text-sm text-gray-700">{invoice.restaurant.cuisine}</p>
                  </div>
                  
                  <div className="mb-4 rounded-md bg-gray-50 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-800">Items:</span>
                      <span className="font-medium text-gray-900">{invoice.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-800">Subtotal:</span>
                      <span className="font-medium text-gray-900">${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    
                    {/* Show credits if present */}
                    {invoice.credits && invoice.credits.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-800">Credits:</span>
                        <span className="font-medium text-green-600">
                          -${Math.abs(invoice.credits.reduce(
                            (total, credit) => total + (credit.price * credit.quantity), 
                            0
                          )).toFixed(2)}
                        </span>
                      </div>
                    )}
                    
                    <div className="mt-2 border-t border-gray-200 pt-2 font-bold">
                      <div className="flex justify-between">
                        <span className="text-gray-900">Total:</span>
                        <span className="text-gray-900">${invoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-700">
                    {/* Show items */}
                    {invoice.items.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="mb-1">
                        {item.quantity} × {item.name}
                      </div>
                    ))}
                    {invoice.items.length > 3 && (
                      <div className="text-gray-600">
                        +{invoice.items.length - 3} more items
                      </div>
                    )}
                    
                    {/* Show credits */}
                    {invoice.credits && invoice.credits.length > 0 && (
                      <div className="mt-2 border-t border-gray-200 pt-2">
                        <div className="text-sm font-medium text-green-600">Credits:</div>
                        {invoice.credits.map((credit: any, i: number) => (
                          <div key={i} className="mb-1 text-green-600">
                            {credit.quantity} × {credit.name} (-${Math.abs(credit.price).toFixed(2)})
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ClientOnly>
      </div>
    </div>
  );
} 