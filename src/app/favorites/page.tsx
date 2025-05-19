'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import ClothingCard from '@/components/clothing/ClothingCard';

export default function FavoritesPage() {
  const favorites = useAppStore((state) => state.favorites || []);
  const removeFromFavorites = useAppStore((state) => state.removeFromFavorites);
  
  const [sortBy, setSortBy] = useState<'recent' | 'price-low' | 'price-high'>('recent');
  
  // Sort favorites based on selected option with safety check
  const sortedFavorites = Array.isArray(favorites) ? [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.item.price - b.item.price;
      case 'price-high':
        return b.item.price - a.item.price;
      case 'recent':
      default:
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    }
  }) : [];
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Your Favorites</h1>
        
        {favorites.length > 0 && (
          <div className="flex items-center">
            <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
              Sort by:
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        )}
      </div>
      
      {!Array.isArray(favorites) || favorites.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
          <p className="text-gray-600 mb-6">
            Items you add to favorites will appear here.
          </p>
          <a
            href="/catalog"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Catalog
          </a>
        </div>
      ) : (
        <>
          <p className="text-gray-600">
            You have {favorites.length} item{favorites.length !== 1 ? 's' : ''} in your favorites.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {sortedFavorites.map((favorite) => (
              <div key={favorite.item.id} className="relative">
                <ClothingCard item={favorite.item} />
                <div className="absolute top-2 right-2 bg-white bg-opacity-75 rounded-full p-1">
                  <button
                    onClick={() => removeFromFavorites(favorite.item.id)}
                    className="text-red-500 hover:text-red-700"
                    aria-label="Remove from favorites"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
} 