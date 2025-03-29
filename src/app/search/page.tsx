'use client';

import React, { useState, useEffect } from 'react';
import { Geist, Roboto_Mono } from "next/font/google";
import SearchBar from '@/app/components/SearchBar';
import CategoryGrid from '@/app/components/CategoryGrid';
import { useInvoice } from '@/app/context/InvoiceContext';
import PageHeader from '@/app/components/PageHeader';

const geistSans = Geist({
  weight: '400',
  subsets: ['latin'],
});

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

// Define interfaces
interface Category {
  id: number;
  name: string;
  image: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  price: number;
  stock: number;
}

// Default categories data with images
const defaultCategories: Category[] = [
  { id: 1, name: 'Spices', image: '/images/categories/spices.jpg' },
  { id: 2, name: 'Herbs', image: '/images/categories/herbs.jpg' },
  { id: 3, name: 'Ice Cream', image: '/images/categories/icecream.jpg' },
  { id: 4, name: 'Vegetables', image: '/images/categories/vegetables.jpg' },
  { id: 5, name: 'Fruits', image: '/images/categories/fruits.jpg' },
  { id: 6, name: 'Dairy', image: '/images/categories/dairy.jpg' },
];

// Define a consistent mapping of default category names to IDs
const DEFAULT_CATEGORY_MAP: {[key: string]: number} = {
  'Spices': 1,
  'Herbs': 2,
  'Ice Cream': 3,
  'Vegetables': 4,
  'Fruits': 5,
  'Dairy': 6
};

export default function SearchPage() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const { getProductStock } = useInvoice();
  
  // Load categories from localStorage products
  useEffect(() => {
    try {
      console.log('Loading categories from localStorage');
      const productsJson = localStorage.getItem('products');
      
      if (productsJson) {
        const products = JSON.parse(productsJson) as Product[];
        console.log('Products loaded:', products.length);
        
        // Get unique categories from products
        const uniqueCategories: Category[] = [];
        const categoryNames = new Set<string>();
        const categoryMap = new Map<string, { id: number, name: string }>();
        
        // First collect all category names from products and track used IDs
        const usedCategoryIds = new Set<number>();
        
        // Add all default category IDs to the used set
        Object.values(DEFAULT_CATEGORY_MAP).forEach(id => {
          usedCategoryIds.add(id);
        });
        
        // Debug log
        console.log('Default category IDs:', Array.from(usedCategoryIds));
        
        // First pass: map the default categories and existing categories with IDs
        products.forEach((product: Product) => {
          if (product.category && !categoryNames.has(product.category)) {
            categoryNames.add(product.category);
            
            // Check if it's a default category first
            if (DEFAULT_CATEGORY_MAP[product.category] !== undefined) {
              const categoryId = DEFAULT_CATEGORY_MAP[product.category];
              usedCategoryIds.add(categoryId);
              
              categoryMap.set(product.category, {
                id: categoryId,
                name: product.category,
              });
            } 
            // Otherwise use the product's categoryId if available
            else if (product.categoryId) {
              usedCategoryIds.add(product.categoryId);
              
              categoryMap.set(product.category, {
                id: product.categoryId,
                name: product.category,
              });
            }
          }
        });
        
        // Second pass: handle categories that need new IDs
        products.forEach((product: Product) => {
          if (product.category && !categoryMap.has(product.category)) {
            // Generate a new unique ID
            let newId = Object.keys(DEFAULT_CATEGORY_MAP).length + 1;
            
            // Make sure the ID isn't already used
            while (usedCategoryIds.has(newId)) {
              newId++;
            }
            
            usedCategoryIds.add(newId);
            
            categoryMap.set(product.category, {
              id: newId,
              name: product.category,
            });
          }
        });
        
        // Then construct categories, maintaining default images where possible
        categoryNames.forEach(categoryName => {
          const category = categoryMap.get(categoryName);
          if (!category) return; // Skip if no category mapping found
          
          const existingCategory = defaultCategories.find(c => c.name === categoryName);
          
          uniqueCategories.push({
            id: category.id,
            name: categoryName,
            // Use existing image or fallback to a default image
            image: existingCategory ? existingCategory.image : '/images/categories/default.jpg'
          });
        });
        
        console.log('Final categories to render:', uniqueCategories.map(c => ({ id: c.id, name: c.name })));
        
        // Verify no duplicate IDs
        const categoryIds = uniqueCategories.map(c => c.id);
        const hasDuplicateIds = categoryIds.length !== new Set(categoryIds).size;
        if (hasDuplicateIds) {
          console.warn('WARNING: Duplicate category IDs before setting state:', 
            categoryIds.filter((id, index) => categoryIds.indexOf(id) !== index));
          
          // De-duplicate by making new IDs for duplicates
          const seenIds = new Set<number>();
          const dedupedCategories = uniqueCategories.map(category => {
            if (seenIds.has(category.id)) {
              // Create a new ID by adding a large offset
              return { ...category, id: category.id + 10000 };
            }
            seenIds.add(category.id);
            return category;
          });
          
          setCategories(dedupedCategories);
        } else if (uniqueCategories.length > 0) {
          setCategories(uniqueCategories);
        }
      }
    } catch (error) {
      console.error('Error processing categories:', error);
      // Fallback to default categories
      setCategories(defaultCategories);
    }
  }, []);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      {/* Search Bar - made wider */}
      <div className="mx-auto max-w-4xl mb-12">
        <SearchBar placeholder="Search for products..." />
      </div>
      
      {/* Categories Section */}
      <div className="mt-4">
        <PageHeader title="CATEGORIES" />
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
} 