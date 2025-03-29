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
        
        // Add summary section
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        // Add summary divider
        doc.setDrawColor(180, 180, 180);
        doc.line(pageWidth - 80, finalY - 5, pageWidth - margin, finalY - 5);
        
        // Add summary items
        const summaryX = pageWidth - 80;
        const valueX = pageWidth - margin;
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Subtotal:', summaryX, finalY, { align: 'left' });
        doc.text(`$${invoice.subtotal.toFixed(2)}`, valueX, finalY, { align: 'right' });
        
        doc.text('Tax (6%):', summaryX, finalY + 7, { align: 'left' });
        doc.text(`$${invoice.tax.toFixed(2)}`, valueX, finalY + 7, { align: 'right' });
        
        doc.text('Delivery Fee:', summaryX, finalY + 14, { align: 'left' });
        doc.text(`$${invoice.deliveryFee.toFixed(2)}`, valueX, finalY + 14, { align: 'right' });
        
        // Total with stronger emphasis
        doc.setDrawColor(100, 100, 100);
        doc.line(pageWidth - 80, finalY + 18, pageWidth - margin, finalY + 18);
        
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('TOTAL:', summaryX, finalY + 25, { align: 'left' });
        doc.text(`$${invoice.total.toFixed(2)}`, valueX, finalY + 25, { align: 'right' });
        
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