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
          
          // Add a temporary highlight effect
          element.classList.add('bg-blue-50');
          setTimeout(() => {
            element.classList.remove('bg-blue-50');
            element.classList.add('bg-white');
          }, 2000);
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
        const margin = 14;
        
        // Add company header
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Elite-Prod', margin, 20);
        
        // Add company subtitle
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('Elite Products LLC', margin, 25);
        
        // Add subtle separator line
        doc.setDrawColor(80, 80, 80);
        doc.setLineWidth(0.5);
        doc.line(margin, 30, pageWidth - margin, 30);
        
        // Add invoice title
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('INVOICE', pageWidth - margin, 20, { align: 'right' });
        
        // Add invoice metadata
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE #:', margin, 40);
        doc.text('DATE:', margin, 47);
        doc.text('RESTAURANT:', margin, 54);
        doc.text('CUISINE:', margin, 61);
        
        // Add invoice metadata values
        doc.setFont('helvetica', 'normal');
        doc.text(invoice.id.toString(), margin + 30, 40);
        doc.text(invoice.date, margin + 30, 47);
        doc.text(invoice.restaurant.name, margin + 30, 54);
        doc.text(invoice.restaurant.cuisine, margin + 30, 61);
        
        // Add billing summary label
        doc.setFont('helvetica', 'bold');
        doc.text('ITEMS', margin, 75);
        
        // Add another separator line
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.2);
        doc.line(margin, 78, pageWidth - margin, 78);
        
        // Add items table with clean black and white style
        const tableColumn = ["Item", "Category", "Price", "Qty", "Total"];
        const tableRows = invoice.items.map((item: any) => [
          item.name,
          item.category,
          `$${item.price.toFixed(2)}`,
          item.quantity,
          `$${(item.price * item.quantity).toFixed(2)}`
        ]);
        
        // Use autoTable with professional black and white theme
        jsPDFAutoTable.default(doc, {
          startY: 83,
          head: [tableColumn],
          body: tableRows,
          theme: 'plain',
          styles: {
            fontSize: 9,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [240, 240, 240],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
            lineWidth: 0.1,
            lineColor: [200, 200, 200],
          },
          bodyStyles: {
            lineWidth: 0.1,
            lineColor: [220, 220, 220],
          },
          alternateRowStyles: {
            fillColor: [248, 248, 248],
          },
          margin: { left: margin, right: margin },
        });
        
        // Get the Y position after the items table
        let finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Add credits table if there are any credits
        if (invoice.credits && invoice.credits.length > 0) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('CREDITS', margin, finalY + 5);
          
          // Add separator line for credits
          doc.setDrawColor(180, 180, 180);
          doc.setLineWidth(0.2);
          doc.line(margin, finalY + 8, pageWidth - margin, finalY + 8);
          
          const creditTableColumn = ["Description", "Amount", "Qty", "Total"];
          const creditTableRows = invoice.credits.map((credit: any) => [
            credit.name,
            `$${Math.abs(credit.price).toFixed(2)}`,
            credit.quantity,
            `-$${Math.abs(credit.price * credit.quantity).toFixed(2)}`
          ]);
          
          jsPDFAutoTable.default(doc, {
            startY: finalY + 13,
            head: [creditTableColumn],
            body: creditTableRows,
            theme: 'plain',
            styles: {
              fontSize: 9,
              cellPadding: 4,
            },
            headStyles: {
              fillColor: [240, 255, 240], // Light green background for credits
              textColor: [0, 100, 0], // Dark green text
              fontStyle: 'bold',
              lineWidth: 0.1,
              lineColor: [200, 200, 200],
            },
            bodyStyles: {
              lineWidth: 0.1,
              lineColor: [220, 220, 220],
              textColor: [0, 100, 0], // Dark green text
            },
            alternateRowStyles: {
              fillColor: [248, 255, 248], // Light green alternate rows
            },
            margin: { left: margin, right: margin },
          });
          
          finalY = (doc as any).lastAutoTable.finalY + 10;
        }
        
        // Add summary section
        doc.setDrawColor(180, 180, 180);
        doc.line(pageWidth - 80, finalY - 5, pageWidth - margin, finalY - 5);
        
        // Add summary items
        const summaryX = pageWidth - 80;
        const valueX = pageWidth - margin;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', summaryX, finalY, { align: 'left' });
        doc.text(`$${invoice.subtotal.toFixed(2)}`, valueX, finalY, { align: 'right' });
        
        // If there are credits, show them in the summary
        let currY = finalY;
        if (invoice.credits && invoice.credits.length > 0) {
          const creditsTotal = invoice.credits.reduce(
            (total: number, credit: any) => total + (credit.price * credit.quantity), 
            0
          );
          
          if (creditsTotal !== 0) {
            currY += 7;
            doc.setTextColor(0, 100, 0); // Green for credits
            doc.text('Credits:', summaryX, currY, { align: 'left' });
            doc.text(`-$${Math.abs(creditsTotal).toFixed(2)}`, valueX, currY, { align: 'right' });
            doc.setTextColor(0, 0, 0); // Reset to black
          }
        }
        
        doc.text('Tax (6%):', summaryX, currY + 7, { align: 'left' });
        doc.text(`$${invoice.tax.toFixed(2)}`, valueX, currY + 7, { align: 'right' });
        
        doc.text('Delivery Fee:', summaryX, currY + 14, { align: 'left' });
        doc.text(`$${invoice.deliveryFee.toFixed(2)}`, valueX, currY + 14, { align: 'right' });
        
        // Total with stronger emphasis
        doc.setDrawColor(100, 100, 100);
        doc.line(pageWidth - 80, currY + 18, pageWidth - margin, currY + 18);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('TOTAL:', summaryX, currY + 25, { align: 'left' });
        doc.text(`$${invoice.total.toFixed(2)}`, valueX, currY + 25, { align: 'right' });
        
        // Add footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setDrawColor(120, 120, 120);
        doc.line(margin, 270, pageWidth - margin, 270);
        doc.text('Thank you for your business', pageWidth / 2, 277, { align: 'center' });
        doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, 282, { align: 'center' });
        
        // Save the PDF
        doc.save(`Invoice_${invoice.id}.pdf`);
      });
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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
                  className="rounded-lg border border-gray-300 bg-white p-4 shadow-md sm:p-6 transition-colors duration-500"
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