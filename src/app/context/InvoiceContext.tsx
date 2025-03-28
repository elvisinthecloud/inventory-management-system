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

// Define product interface with stock
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
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
  getProductStock: (productId: number) => number;
  updateProductStock: (productId: number, newStock: number) => void;
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

  // Track product stock
  const [productStock, setProductStock] = useState<{[key: number]: number}>(() => {
    if (typeof window !== 'undefined') {
      const savedStock = localStorage.getItem('productStock');
      if (savedStock) {
        return JSON.parse(savedStock);
      }
    }
    
    // Load initial stock data - in a real app, this would come from an API
    const initialStock = {
      1: 15, // Cinnamon
      2: 8,  // Cardamom
      3: 20, // Turmeric
      4: 12, // Basil
      5: 18, // Mint
      6: 5,  // Rosemary
      7: 10, // Vanilla Ice Cream
      8: 14, // Chocolate Ice Cream
      9: 7,  // Strawberry Ice Cream
      10: 25, // Tomatoes
      11: 30, // Carrots
      12: 15, // Broccoli
      13: 40, // Apples
      14: 35, // Bananas
      15: 22, // Oranges
      16: 42, // Milk
      17: 6,  // Cheese
      18: 18, // Yogurt
    };
    
    // If we're on the client, save this initial data to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('productStock', JSON.stringify(initialStock));
    }
    
    return initialStock;
  });

  // Save invoice to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('invoice', JSON.stringify(invoice));
  }, [invoice]);

  // Save product stock to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('productStock', JSON.stringify(productStock));
  }, [productStock]);

  // Calculate total number of items in invoice
  const totalItems = invoice.items.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal
  const subtotal = invoice.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Get stock for a product
  const getProductStock = (productId: number): number => {
    return productStock[productId] || 0;
  };

  // Update stock for a product
  const updateProductStock = (productId: number, newStock: number) => {
    setProductStock(prev => ({
      ...prev,
      [productId]: Math.max(0, newStock) // Ensure stock doesn't go below 0
    }));
  };

  // Add an item to the invoice
  const addItem = (item: Omit<InvoiceItem, 'quantity'>) => {
    // Check if we have stock available
    const currentStock = getProductStock(item.id);
    if (currentStock <= 0) {
      alert(`Cannot add ${item.name} - Out of stock!`);
      return;
    }

    setInvoice(prevInvoice => {
      // Check if item already exists in invoice
      const existingItemIndex = prevInvoice.items.findIndex(invoiceItem => invoiceItem.id === item.id);
      
      if (existingItemIndex > -1) {
        // If exists, check if we can increment quantity
        const currentQuantity = prevInvoice.items[existingItemIndex].quantity;
        
        if (currentQuantity >= currentStock) {
          alert(`Cannot add more ${item.name} - Stock limit reached!`);
          return prevInvoice;
        }
        
        // If stock available, increment quantity
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
    
    // Check stock when increasing quantity
    const currentStock = getProductStock(itemId);
    const currentItem = invoice.items.find(item => item.id === itemId);
    
    if (currentItem && quantity > currentItem.quantity && quantity > currentStock) {
      alert(`Cannot set quantity to ${quantity} - Only ${currentStock} in stock!`);
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
      subtotal,
      getProductStock,
      updateProductStock
    }}>
      {children}
    </InvoiceContext.Provider>
  );
}; 