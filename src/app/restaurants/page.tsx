import React from 'react';
import RestaurantList from '../components/RestaurantList';
import PageHeader from '@/app/components/PageHeader';

export default function RestaurantsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <PageHeader title="SELECT RESTAURANT" />
      
      <p className="mb-6 text-gray-300">
        Choose a restaurant to start your order. Your cart will be tied to the selected restaurant.
      </p>
      
      <RestaurantList />
    </div>
  );
} 