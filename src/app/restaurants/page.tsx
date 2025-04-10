'use client';

import React from 'react';
import RestaurantList from '../components/RestaurantList';
import PageHeader from '@/app/components/PageHeader';

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Full-width header with action element */}
      <PageHeader 
        title="SELECT STORE" 
        fullWidth={true}
        withAction={ 
          <div className="bg-gray-100 px-4 py-2 rounded-lg">
            <span className="font-medium text-gray-900">74</span> <span className="text-gray-700">stores available</span>
          </div>
        }
      />
      
      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-28 pt-2 flex-grow">
        <RestaurantList />
      </div>
    </div>
  );
} 