'use client';

import React from 'react';
import { useInvoice, Restaurant } from '../context/InvoiceContext';
import { useRouter } from 'next/navigation';

// Mock restaurant data
const restaurants: Restaurant[] = [
  { id: 1, name: 'Mi Tios', cuisine: 'Mexican' },
  { id: 2, name: 'Fiesta', cuisine: 'Tex-Mex' },
  { id: 3, name: 'El Guanaco', cuisine: 'Salvadorian' },
  { id: 4, name: 'La Malinche', cuisine: 'Spanish Tapas' },
  { id: 5, name: 'Pho House', cuisine: 'Vietnamese' },
  { id: 6, name: 'Sushi Palace', cuisine: 'Japanese' },
  { id: 7, name: 'Pizza Bros', cuisine: 'Italian' },
  { id: 8, name: 'Taj Mahal', cuisine: 'Indian' },
];

export default function RestaurantList() {
  const { setRestaurant, invoice } = useInvoice();
  const router = useRouter();

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setRestaurant(restaurant);
    
    // Navigate to search page to add items
    router.push('/search');
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant) => (
        <div 
          key={restaurant.id}
          className={`cursor-pointer overflow-hidden rounded-lg border ${
            invoice.restaurant?.id === restaurant.id 
              ? 'border-blue-600 ring-2 ring-blue-400' 
              : 'border-gray-300'
          } bg-white p-6 shadow-md transition-all hover:shadow-lg active:bg-blue-50`}
          onClick={() => handleSelectRestaurant(restaurant)}
        >
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <span className="material-icons text-2xl">restaurant</span>
          </div>
          <h3 className="mb-1 text-xl font-bold text-gray-900">{restaurant.name}</h3>
          <p className="font-medium text-gray-700">{restaurant.cuisine}</p>
          
          {invoice.restaurant?.id === restaurant.id && (
            <div className="mt-3 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
              <span className="material-icons text-xs mr-1">check_circle</span>
              Selected
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 