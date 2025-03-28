// Mock data for development 

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  lastUpdated: string;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  productCount: number;
};

export type Delivery = {
  id: string;
  customerName: string;
  email: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  address: string;
  total: number;
};

export type Invoice = {
  id: string;
  customerName: string;
  email: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  dateIssued: string;
  total: number;
};

// Sample data
export const products: Product[] = [
  {
    id: '1',
    name: 'Ergonomic Office Chair',
    sku: 'CH-001',
    category: 'Office Furniture',
    price: 249.99,
    stock: 24,
    status: 'In Stock',
    lastUpdated: '2023-04-15'
  }
];

export const categories: Category[] = [
  {
    id: '1',
    name: 'Office Furniture',
    description: 'Desks, chairs, and other furniture',
    productCount: 12
  }
];

export const deliveries: Delivery[] = [
  {
    id: '1',
    customerName: 'John Smith',
    email: 'john@example.com',
    status: 'Pending',
    date: '2023-04-18',
    address: '123 Main St',
    total: 349.99
  }
];

export const invoices: Invoice[] = [
  {
    id: 'INV-001',
    customerName: 'John Smith',
    email: 'john@example.com',
    status: 'Pending',
    dateIssued: '2023-04-18',
    total: 349.99
  }
]; 