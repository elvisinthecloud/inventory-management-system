'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { baseProducts } from '@/data/defaultProducts'; // Import shared baseProducts

// Define types for our invoice items
export interface InvoiceItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

// Define credit item interface
export interface CreditItem {
  id: string; // Using string id to distinguish from regular items
  name: string;
  price: number; // This will be a negative value
  quantity: number;
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

// Define the invoice state interface
interface InvoiceState {
  items: InvoiceItem[];
  credits: CreditItem[];
  restaurant: Restaurant | null;
}

// Define type for invoice history items
export interface InvoiceHistoryItem {
  id: string;
  date: string;
  restaurant: Restaurant;
  items: InvoiceItem[];
  credits: CreditItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

// Define the invoice context interface
interface InvoiceContextType {
  invoice: InvoiceState;
  addItem: (item: Omit<InvoiceItem, 'quantity'>) => void;
  removeItem: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  addCredit: (credit: Omit<CreditItem, 'id'>) => void;
  removeCredit: (creditId: string) => void;
  updateCreditQuantity: (creditId: string, quantity: number) => void;
  clearInvoice: () => void;
  setRestaurant: (restaurant: Restaurant) => void;
  totalItems: number;
  subtotal: number;
  creditsTotal: number;
  getProductStock: (productId: number) => number;
  updateProductStock: (productId: number, newStock: number) => void;
  invoiceHistory: InvoiceHistoryItem[];
  saveInvoiceToHistory: (invoice: InvoiceHistoryItem) => void;
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
  const [invoice, setInvoice] = useState<InvoiceState>({ items: [], credits: [], restaurant: null });
  // Initialize productStock state as an empty object initially
  const [productStock, setProductStock] = useState<{[key: number]: number}>({});
  const [invoiceHistory, setInvoiceHistory] = useState<InvoiceHistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);
  // Add a ref to track if initial stock has been set
  const initialStockSet = React.useRef(false);
  
  // Defensive measure: ensure credits is always defined, even during race conditions
  if (!invoice.credits) {
    invoice.credits = [];
  }
  
  // After component mounts (client-side only), initialize from localStorage
  useEffect(() => {
    setIsClient(true);
    
    // Get saved invoice from localStorage
    const savedInvoice = localStorage.getItem('invoice');
    if (savedInvoice) {
      try {
        const parsedInvoice = JSON.parse(savedInvoice);
        // Ensure credits array is always present (for backward compatibility)
        if (!parsedInvoice.credits) {
          parsedInvoice.credits = [];
        }
        setInvoice(parsedInvoice);
      } catch (error) {
        console.error("Error parsing saved invoice:", error);
        // If there's an error, use the default state
        setInvoice({ items: [], credits: [], restaurant: null });
      }
    }
    
    // Get saved invoice history from localStorage
    const savedHistory = localStorage.getItem('invoiceHistory');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        // Ensure each history item has a credits property
        const updatedHistory = parsedHistory.map((item: Partial<InvoiceHistoryItem>) => ({
          ...item,
          credits: item.credits || [] // Add empty credits array if missing
        }));
        setInvoiceHistory(updatedHistory);
      } catch (error) {
        console.error("Error parsing invoice history:", error);
        setInvoiceHistory([]);
      }
    }

    // Load or Initialize Product Stock
    if (!initialStockSet.current) { // Only run initialization once
      const savedStock = localStorage.getItem('productStock');
      if (savedStock) {
        console.log('InvoiceContext: Loading productStock from localStorage');
        try {
          setProductStock(JSON.parse(savedStock));
        } catch (error) {
          console.error("Error parsing productStock from localStorage:", error);
          // Fallback if parsing fails - initialize from baseProducts
          console.log('InvoiceContext: Initializing productStock from baseProducts due to parse error.');
          const initialStock = baseProducts.reduce((acc, product) => {
            acc[product.id] = product.stock;
            return acc;
          }, {} as {[key: number]: number});
          setProductStock(initialStock);
          localStorage.setItem('productStock', JSON.stringify(initialStock)); // Save the initialized stock
        }
      } else {
        // If no saved stock, initialize from baseProducts
        console.log('InvoiceContext: Initializing productStock from baseProducts.');
        const initialStock = baseProducts.reduce((acc, product) => {
          acc[product.id] = product.stock;
          return acc;
        }, {} as {[key: number]: number});
        setProductStock(initialStock);
        // Save the initialized stock to localStorage
        localStorage.setItem('productStock', JSON.stringify(initialStock));
      }
      initialStockSet.current = true; // Mark as initialized
    }

  }, []); // Empty dependency array ensures this runs only once on mount

  // Save invoice to localStorage whenever it changes (but only on client)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('invoice', JSON.stringify(invoice));
    }
  }, [invoice, isClient]);

  // Save product stock to localStorage whenever it changes (but only on client)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('productStock', JSON.stringify(productStock));
    }
  }, [productStock, isClient]);

  // Save invoice history to localStorage whenever it changes (but only on client)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('invoiceHistory', JSON.stringify(invoiceHistory));
    }
  }, [invoiceHistory, isClient]);

  // Calculate total number of items in invoice
  const totalItems = invoice.items.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal of regular items
  const itemsSubtotal = invoice.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calculate total credits with defensive coding to handle potentially undefined credits
  const creditsTotal = invoice.credits?.reduce((total, credit) => total + (credit.price * credit.quantity), 0) || 0;
  
  // Final subtotal is items minus credits
  const subtotal = itemsSubtotal + creditsTotal;

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
    // Check stock using the context's getProductStock (single source of truth)
    const currentStock = getProductStock(item.id);
    
    // If item is completely out of stock
    if (currentStock <= 0) {
      alert(`Cannot add ${item.name} - Out of stock!`);
      return;
    }

    setInvoice(prevInvoice => {
      const existingItemIndex = prevInvoice.items.findIndex(invoiceItem => invoiceItem.id === item.id);
      
      if (existingItemIndex > -1) {
        const currentQuantity = prevInvoice.items[existingItemIndex].quantity;
        
        // Check against current stock from context
        if (currentQuantity >= currentStock) {
          alert(`Cannot add more ${item.name} - Stock limit reached (${currentStock})!`);
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
    const currentItem = invoice.items.find(item => item.id === itemId);
    if (!currentItem) return;
    
    // Get current stock using the context's getProductStock (single source of truth)
    const currentStock = getProductStock(itemId);

    // If item is completely out of stock (stock is 0)
    if (currentStock === 0) {
      alert(`${currentItem.name} is now out of stock and will be removed from your invoice.`);
      removeItem(itemId);
      return;
    }
    
    // Handle normal quantity reduction
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    
    // Check if requested quantity exceeds available stock
    if (quantity > currentStock) {
      alert(`Cannot set quantity to ${quantity} - Only ${currentStock} in stock! Setting to max available.`);
      quantity = currentStock; // Cap at available stock
    }
    
    // Update the quantity
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      items: prevInvoice.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    }));
  };

  // Add a credit to the invoice
  const addCredit = (credit: Omit<CreditItem, 'id'>) => {
    // Ensure price is negative
    const creditPrice = credit.price > 0 ? -credit.price : credit.price;
    
    setInvoice(prevInvoice => {
      // Generate a unique ID for this credit
      const creditId = `credit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      return {
        ...prevInvoice,
        credits: [...prevInvoice.credits, { 
          ...credit, 
          id: creditId,
          price: creditPrice // Ensure price is negative
        }]
      };
    });
  };

  // Remove a credit from the invoice
  const removeCredit = (creditId: string) => {
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      credits: prevInvoice.credits.filter(credit => credit.id !== creditId)
    }));
  };

  // Update the quantity of a credit
  const updateCreditQuantity = (creditId: string, quantity: number) => {
    if (quantity < 1) {
      // If quantity is less than 1, remove the credit
      removeCredit(creditId);
      return;
    }
    
    // Update the quantity
    setInvoice(prevInvoice => ({
      ...prevInvoice,
      credits: prevInvoice.credits.map(credit => 
        credit.id === creditId ? { ...credit, quantity } : credit
      )
    }));
  };

  // Clear the invoice
  const clearInvoice = () => {
    setInvoice({ items: [], credits: [], restaurant: null });
  };

  // Set the restaurant
  const setRestaurant = (restaurant: Restaurant) => {
    // If changing restaurant, clear the invoice first
    if (invoice.restaurant && invoice.restaurant.id !== restaurant.id && invoice.items.length > 0) {
      if (typeof window !== 'undefined' && window.confirm('Changing restaurant will clear your current invoice. Continue?')) {
        setInvoice({ items: [], credits: [], restaurant });
      }
    } else {
      setInvoice(prevInvoice => ({
        ...prevInvoice,
        restaurant
      }));
    }
  };

  // Save an invoice to history
  const saveInvoiceToHistory = (invoiceItem: InvoiceHistoryItem) => {
    setInvoiceHistory(prev => [invoiceItem, ...prev]);
  };

  // Create context value object
  const contextValue = {
    invoice,
    addItem,
    removeItem,
    updateQuantity,
    addCredit,
    removeCredit,
    updateCreditQuantity,
    clearInvoice,
    setRestaurant,
    totalItems,
    subtotal,
    creditsTotal,
    getProductStock,
    updateProductStock,
    invoiceHistory,
    saveInvoiceToHistory
  };

  // Provide the invoice context to children, but only render the actual content on the client
  return (
    <InvoiceContext.Provider value={contextValue}>
      <ClientOnly>
        {children}
      </ClientOnly>
    </InvoiceContext.Provider>
  );
}; 