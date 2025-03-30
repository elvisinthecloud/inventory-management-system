import React from 'react';
import RestaurantList from '../components/RestaurantList';
import PageHeader from '@/app/components/PageHeader';

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Full-width header */}
      <PageHeader 
        title="SELECT RESTAURANT" 
        fullWidth={true}
      />
      
      {/* Content with proper padding */}
      <div className="container mx-auto px-4 pb-20 pt-2 flex-grow">
        <p className="mb-6 text-gray-700">
          Choose a restaurant to start your order. Your cart will be tied to the selected restaurant.
        </p>
        
        <RestaurantList />
      </div>
    </div>
  );
} 