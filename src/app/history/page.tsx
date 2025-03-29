'use client';

import React from 'react';
import { useInvoice } from '../context/InvoiceContext';
import { Roboto_Mono } from "next/font/google";
import Link from 'next/link';
import PageHeader from '@/app/components/PageHeader';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

export default function HistoryPage() {
  const { invoiceHistory } = useInvoice();

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
        
        // Add header
        doc.setFontSize(22);
        doc.setTextColor(44, 62, 80);
        doc.text('INVOICE', 105, 15, { align: 'center' });
        
        // Add invoice details
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Invoice #: ${invoice.id}`, 14, 30);
        doc.text(`Date: ${invoice.date}`, 14, 37);
        doc.text(`Restaurant: ${invoice.restaurant.name}`, 14, 44);
        doc.text(`Cuisine: ${invoice.restaurant.cuisine}`, 14, 51);
        
        // Add items table
        const tableColumn = ["Item", "Category", "Price", "Quantity", "Total"];
        const tableRows = invoice.items.map((item: any) => [
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
        
        // Add summary
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 140, finalY);
        doc.text(`Tax (6%): $${invoice.tax.toFixed(2)}`, 140, finalY + 7);
        doc.text(`Delivery Fee: $${invoice.deliveryFee.toFixed(2)}`, 140, finalY + 14);
        doc.text(`Total: $${invoice.total.toFixed(2)}`, 140, finalY + 21);
        
        // Save the PDF
        doc.save(`Invoice_${invoice.id}.pdf`);
      });
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-20 pt-6">
      <PageHeader 
        title="INVOICE HISTORY" 
        withAction={
          <Link 
            href="/restaurants" 
            className="flex items-center text-cyan-300 hover:text-cyan-200 font-semibold transition-colors duration-150"
          >
            <span className="material-icons mr-1">add</span>
            <span>New Invoice</span>
          </Link>
        }
      />

      {invoiceHistory.length === 0 ? (
        <div className="my-12 rounded-lg border border-gray-300 bg-white p-8 text-center shadow-md">
          <span className="material-icons mb-4 text-6xl text-gray-400">history</span>
          <h2 className="mb-4 text-2xl font-bold text-gray-800">No Invoice History</h2>
          <p className="mb-8 text-gray-600">You haven't created any invoices yet.</p>
          <Link 
            href="/restaurants" 
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            <span className="material-icons mr-2">add_circle</span>
            Create New Invoice
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {invoiceHistory.map((invoice, index) => (
            <div key={`${invoice.id}-${index}`} className="rounded-lg border border-gray-300 bg-white p-4 shadow-md sm:p-6">
              <div className="mb-4 flex justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Invoice #{invoice.id}</h3>
                  <p className="text-sm text-gray-600">{invoice.date}</p>
                </div>
                <button
                  onClick={() => handleDownloadPDF(invoice)}
                  className="flex items-center rounded-md bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                >
                  <span className="material-icons mr-1">download</span>
                  <span>PDF</span>
                </button>
              </div>
              
              <div className="mb-3">
                <h4 className="text-md font-bold text-gray-700">{invoice.restaurant.name}</h4>
                <p className="text-sm text-gray-600">{invoice.restaurant.cuisine}</p>
              </div>
              
              <div className="mb-4 rounded-md bg-gray-50 p-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{invoice.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="mt-2 border-t border-gray-200 pt-2 font-bold">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span>${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                {invoice.items.slice(0, 3).map((item: any, i: number) => (
                  <div key={i} className="mb-1">
                    {item.quantity} × {item.name}
                  </div>
                ))}
                {invoice.items.length > 3 && (
                  <div className="text-gray-400">
                    +{invoice.items.length - 3} more items
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 