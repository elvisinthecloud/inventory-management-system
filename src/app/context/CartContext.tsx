'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for our invoice items
export interface InvoiceItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

// Define the restaurant interface
export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
}

// Define the invoice state interface
interface InvoiceState {
  items: InvoiceItem[];
  restaurant: Restaurant | null;
}

// Define the invoice context interface
interface InvoiceContextType {
  invoice: InvoiceState;
  addItem: (item: Omit<InvoiceItem, 'quantity'>) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearInvoice: () => void;
  setRestaurant: (restaurant: Restaurant) => void;
  totalItems: number;
  subtotal: number;
}

// Create the context with default values
const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

// Custom hook to use the invoice context
export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
};

// Props for the InvoiceProvider component
interface InvoiceProviderProps {
  children: ReactNode;
}

// Invoice provider component
export const InvoiceProvider = ({ children }: InvoiceProviderProps) => {
  // Initialize state from localStorage on the client side
  const [invoice, setInvoice] = useState<InvoiceState>(() => {
    // Check if window is defined (client side)
    if (typeof window !== 'undefined') {
      const savedInvoice = localStorage.getItem('invoice');
      return savedInvoice ? JSON.parse(savedInvoice) : { items: [], restaurant: null };
    }
    return { items: [], restaurant: null };
  });

  // Save invoice to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('invoice', JSON.stringify(invoice));
  }, [invoice]);

  // Calculate total number of items in invoice
  const totalItems = invoice.items.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal
  const subtotal = invoice.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Add an item to the invoice
  const addItem = (item: Omit<InvoiceItem, 'quantity'>) => {
    setInvoice(prevInvoice => {
      // Check if item already exists in invoice
      const existingItemIndex = prevInvoice.items.findIndex(invoiceItem => invoiceItem.id === item.id);
      
      if (existingItemIndex > -1) {
        // If exists, increment quantity
        const updatedItems = [...prevInvoice.items];
        updatedItems[existingItemIndex].quantity += 1;
        
        return {
          ...prevInvoice,
          items: updatedItems
        };
      } else {
        // If not, add as new item with quantity 1
        return {
          ...prevInvoice,
          items: [...prevInvoice.items, { ...item, quantity: 1 }]
        };
      }
    });
  };

  // Remove an item from the invoice
  const removeItem = (itemId: number) => {
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      items: prevInvoice.items.filter(item => item.id !== itemId)
    }));
  };

  // Update the quantity of an item
  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity < 1) {
      // If quantity is less than 1, remove the item
      removeItem(itemId);
      return;
    }
    
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      items: prevInvoice.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    }));
  };

  // Clear the invoice
  const clearInvoice = () => {
    setInvoice({ items: [], restaurant: null });
  };

  // Set the restaurant
  const setRestaurant = (restaurant: Restaurant) => {
    // If changing restaurant, clear the invoice first
    if (invoice.restaurant && invoice.restaurant.id !== restaurant.id && invoice.items.length > 0) {
      if (confirm('Changing restaurant will clear your current invoice. Continue?')) {
        setInvoice({ items: [], restaurant });
      }
    } else {
      setInvoice(prevInvoice => ({
        ...prevInvoice,
        restaurant
      }));
    }
  };

  // Provide the invoice context to children
  return (
    <InvoiceContext.Provider value={{
      invoice,
      addItem,
      removeItem,
      updateQuantity,
      clearInvoice,
      setRestaurant,
      totalItems,
      subtotal
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}; 