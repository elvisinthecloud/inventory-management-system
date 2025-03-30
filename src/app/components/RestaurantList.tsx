'use client';

import React, { useState, useMemo } from 'react';
import { useInvoice, Restaurant } from '../context/InvoiceContext';
import { useRouter } from 'next/navigation';

// Define location category interface
interface LocationCategory {
  name: string;
  restaurants: Restaurant[];
}

// Organized restaurant data by location
const locationCategories: LocationCategory[] = [
  {
    name: 'Virginia Beach',
    restaurants: [
      { id: 101, name: 'Rio Bravo', cuisine: 'Mexican' },
      { id: 102, name: 'Vasquez', cuisine: 'Latino' },
      { id: 103, name: 'Mi Pueblito', cuisine: 'Mexican' },
      { id: 104, name: 'Farm Fresh', cuisine: 'Latino' },
      { id: 105, name: 'Obraje', cuisine: 'Latino' },
      { id: 106, name: 'Genesis', cuisine: 'Latino' },
      { id: 107, name: 'Lempira 2', cuisine: 'Latino' },
      { id: 108, name: 'Lempira 3', cuisine: 'Latino' },
      { id: 109, name: 'Los Angeles', cuisine: 'Latino' },
      { id: 110, name: 'Mi Rancho', cuisine: 'Mexican' },
      { id: 111, name: 'Grand Mart', cuisine: 'Latino' },
      { id: 112, name: 'Los Santos', cuisine: 'Latino' },
      { id: 113, name: 'El Chapin', cuisine: 'Guatemalan' },
      { id: 114, name: 'Tabasco', cuisine: 'Mexican' },
      { id: 115, name: 'Save-A-Lot (Virginia Beach)', cuisine: 'Latino' },
      { id: 116, name: 'Mi Tienda Esquina', cuisine: 'Latino' },
      { id: 117, name: 'Latino Unidos', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Eastern Shore',
    restaurants: [
      { id: 201, name: 'Casa Hispana', cuisine: 'Latino' },
      { id: 202, name: 'Taqueria Ranchito', cuisine: 'Mexican' },
      { id: 203, name: 'Carmelitas', cuisine: 'Latino' },
      { id: 204, name: 'El Crucero', cuisine: 'Latino' },
      { id: 205, name: 'Remolino', cuisine: 'Latino' },
      { id: 206, name: 'El Mercado', cuisine: 'Latino' },
      { id: 207, name: 'Emmanuel', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Salisbury',
    restaurants: [
      { id: 301, name: 'Union Latina', cuisine: 'Latino' },
      { id: 302, name: 'Sanchez', cuisine: 'Latino' },
      { id: 303, name: 'La Mexicana', cuisine: 'Mexican' },
    ]
  },
  {
    name: 'Delaware',
    restaurants: [
      { id: 401, name: 'La Estrella', cuisine: 'Latino' },
      { id: 402, name: 'El Rey Chapin', cuisine: 'Guatemalan' },
      { id: 403, name: 'Tienda La Bonita', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Charlottesville',
    restaurants: [
      { id: 501, name: 'Super Amanecer', cuisine: 'Latino' },
      { id: 502, name: 'Tiendita Latina', cuisine: 'Latino' },
      { id: 503, name: 'Mercado Amigos', cuisine: 'Latino' },
      { id: 504, name: 'Super Diaz', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Lynchburg',
    restaurants: [
      { id: 601, name: 'Super Amanecer 2', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Richmond',
    restaurants: [
      { id: 701, name: 'Big Apple', cuisine: 'Latino' },
      { id: 702, name: 'Varidades', cuisine: 'Latino' },
      { id: 703, name: 'El Compas', cuisine: 'Latino' },
      { id: 704, name: 'El Famoso Market', cuisine: 'Latino' },
      { id: 705, name: 'New Grand Mart', cuisine: 'Latino' },
      { id: 706, name: 'Dorado', cuisine: 'Latino' },
      { id: 707, name: 'Dorado 2', cuisine: 'Latino' },
      { id: 708, name: 'Happy Mart', cuisine: 'Latino' },
      { id: 709, name: 'Las Torres', cuisine: 'Latino' },
      { id: 710, name: 'Victoria', cuisine: 'Latino' },
      { id: 711, name: 'Mi Cielito Lindo', cuisine: 'Mexican' },
      { id: 712, name: 'Mi Guerrero Grill', cuisine: 'Mexican' },
      { id: 713, name: 'El Mercadito', cuisine: 'Latino' },
      { id: 714, name: 'Super Fresh', cuisine: 'Latino' },
      { id: 715, name: 'International', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Hopewell & Petersburg',
    restaurants: [
      { id: 801, name: 'Save-A-Lot (Hopewell)', cuisine: 'Latino' },
      { id: 802, name: 'J & A', cuisine: 'Latino' },
      { id: 803, name: 'Taqueria Doña Rosa', cuisine: 'Mexican' },
      { id: 804, name: 'Adrianna\'s', cuisine: 'Latino' },
      { id: 805, name: 'Sol Market', cuisine: 'Latino' },
      { id: 806, name: 'So Market', cuisine: 'Latino' },
      { id: 807, name: 'Maria\'s Mini Market', cuisine: 'Latino' },
      { id: 808, name: 'Maria\'s Mini Market 2', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Local',
    restaurants: [
      { id: 901, name: 'Tio\'s Market', cuisine: 'Latino' },
      { id: 902, name: 'Migueleña', cuisine: 'Latino' },
      { id: 903, name: 'Good Fortune', cuisine: 'Latino' },
      { id: 904, name: 'Eben-Ezer', cuisine: 'Latino' },
      { id: 905, name: 'Laundromat', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Baltimore',
    restaurants: [
      { id: 1001, name: 'Favorita', cuisine: 'Latino' },
      { id: 1002, name: 'La Favorita', cuisine: 'Latino' },
      { id: 1003, name: 'Perez International', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Fredericksburg',
    restaurants: [
      { id: 1101, name: 'Fiesta', cuisine: 'Latino' },
      { id: 1102, name: 'Milagrito', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Winchester',
    restaurants: [
      { id: 1201, name: 'Paraiso', cuisine: 'Latino' },
    ]
  },
  {
    name: 'Culpeper',
    restaurants: [
      { id: 1301, name: 'Eben-Ezer (Culpeper)', cuisine: 'Latino' },
    ]
  },
];

export default function RestaurantList() {
  const { setRestaurant, invoice } = useInvoice();
  const router = useRouter();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    setRestaurant(restaurant);
    
    // Navigate to search page to add items
    router.push('/search');
  };

  const toggleCategory = (categoryName: string) => {
    if (expandedCategory === categoryName) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categoryName);
    }
  };
  
  // Filter categories and restaurants based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return locationCategories;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return locationCategories
      .map(category => {
        // Filter restaurants that match the search term
        const filteredRestaurants = category.restaurants.filter(
          restaurant => restaurant.name.toLowerCase().includes(term)
        );
        
        // Only include categories that have restaurants matching the search
        return {
          ...category,
          restaurants: filteredRestaurants
        };
      })
      .filter(category => category.restaurants.length > 0);
  }, [searchTerm, locationCategories]);
  
  // Auto-expand categories when searching
  const shouldExpandCategory = (categoryName: string) => {
    return searchTerm.trim() !== '' || expandedCategory === categoryName;
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="material-icons text-gray-400">search</span>
          </div>
          <input
            type="text"
            className="block w-full py-3 pl-10 pr-3 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            placeholder="Search for store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3"
              onClick={() => setSearchTerm('')}
            >
              <span className="material-icons text-gray-400 hover:text-gray-600">clear</span>
            </button>
          )}
        </div>
      </div>
      
      {filteredCategories.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-300 text-center">
          <span className="material-icons text-5xl text-gray-400 mb-3">search_off</span>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No stores found</h3>
          <p className="text-gray-600">Try adjusting your search term</p>
        </div>
      ) : (
        filteredCategories.map((category) => (
          <div key={category.name} className="overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm">
            <div 
              className="flex cursor-pointer items-center justify-between bg-gray-100 px-6 py-4"
              onClick={() => toggleCategory(category.name)}
            >
              <div className="flex items-center">
                <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-sm rounded-full">
                  {category.restaurants.length}
                </span>
              </div>
              <span className="material-icons">
                {shouldExpandCategory(category.name) ? 'expand_less' : 'expand_more'}
              </span>
            </div>
            
            {shouldExpandCategory(category.name) && (
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                {category.restaurants.map((restaurant) => (
                  <div 
                    key={restaurant.id}
                    className={`cursor-pointer overflow-hidden rounded-lg border ${
                      invoice.restaurant?.id === restaurant.id 
                        ? 'border-blue-600 ring-2 ring-blue-400' 
                        : 'border-gray-200'
                    } bg-white p-4 shadow-sm transition-all hover:shadow-md active:bg-blue-50`}
                    onClick={() => handleSelectRestaurant(restaurant)}
                  >
                    <h3 className="mb-1 text-base font-bold text-gray-900">{restaurant.name}</h3>
                    <p className="text-sm text-gray-600">{restaurant.cuisine}</p>
                    
                    {invoice.restaurant?.id === restaurant.id && (
                      <div className="mt-2 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        <span className="material-icons text-xs mr-0.5">check_circle</span>
                        Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
} 