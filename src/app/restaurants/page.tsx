import React from 'react';
import { Roboto_Mono } from "next/font/google";
import RestaurantList from '../components/RestaurantList';

const robotoMono = Roboto_Mono({
  weight: '700',
  subsets: ['latin'],
});

export default function RestaurantsPage() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-6">
      <h1 className={`${robotoMono.className} mb-8 border-b-4 border-blue-500 pb-2 text-3xl uppercase tracking-wider text-gray-800`}>
        SELECT RESTAURANT
      </h1>
      
      <p className="mb-6 text-gray-600">
        Choose a restaurant to start your order. Your cart will be tied to the selected restaurant.
      </p>
      
      <RestaurantList />
    </div>
  );
} 