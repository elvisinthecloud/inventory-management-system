'use client';

import React from 'react';
import RestaurantList from '../components/RestaurantList';
import PageHeader from '@/app/components/PageHeader';

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Full-width header */}
      <PageHeader 
        title="SELECT STORE" 
        fullWidth={true}
      />
      
      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-28 pt-2 flex-grow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Store Directory</h2>
            <p className="text-gray-700">
              Choose a store to start your order. Your cart will be tied to the selected store.
            </p>
          </div>
          <div className="mt-3 md:mt-0 bg-gray-100 px-4 py-2 rounded-lg">
            <span className="font-medium text-gray-900">74</span> <span className="text-gray-700">stores available</span>
          </div>
        </div>
        
        <RestaurantList />
      </div>
    </div>
  );
} 