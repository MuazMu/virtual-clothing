'use client';

import { useState } from 'react';
import { ClothingItem } from '@/lib/types';
import { useAppStore } from '@/lib/store';

interface ClothingCardProps {
  item: ClothingItem;
}

export default function ClothingCard({ item }: ClothingCardProps) {
  const [selectedSize, setSelectedSize] = useState<string>(item.sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string>(item.colors[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const selectClothing = useAppStore((state) => state.selectClothing);
  const addToCart = useAppStore((state) => state.addToCart);
  const addToFavorites = useAppStore((state) => state.addToFavorites);
  const favorites = useAppStore((state) => state.favorites);
  
  const isFavorite = favorites.some((fav) => fav.item.id === item.id);
  
  const handleTryOn = () => {
    selectClothing(item.type, item);
  };
  
  const handleAddToCart = () => {
    addToCart(item, selectedSize, selectedColor, 1);
  };
  
  const handleToggleFavorite = () => {
    addToFavorites(item);
  };
  
  const handleBuyNow = () => {
    // Open the affiliate link in a new tab
    window.open(item.affiliateLink, '_blank');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={item.images.thumbnail}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Try On button overlay */}
        <button
          onClick={handleTryOn}
          className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
        >
          Try On
        </button>
        
        {/* Favorite button */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-2 left-2 p-2 rounded-full bg-white bg-opacity-70 hover:bg-opacity-100 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill={isFavorite ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            stroke="currentColor"
            className={`w-5 h-5 ${isFavorite ? 'text-red-500' : 'text-gray-600'}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-gray-600 text-sm">{item.store}</p>
          </div>
          <div className="text-lg font-bold">
            {item.price.toFixed(2)} {item.currency}
          </div>
        </div>
        
        {/* Description (toggle) */}
        <div className="mt-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-gray-500 flex items-center"
          >
            {isExpanded ? 'Hide details' : 'Show details'}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`ml-1 h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isExpanded && (
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          )}
        </div>
        
        {/* Size selector */}
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <div className="flex flex-wrap gap-2">
            {item.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-2 py-1 text-xs rounded-md border ${
                  selectedSize === size
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        {/* Color selector (if more than one color) */}
        {item.colors.length > 1 && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {item.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-blue-600' : 'border-transparent'
                  }`}
                  style={{
                    backgroundColor: color === 'multicolor' ? 'linear-gradient(to right, red, blue)' : color,
                    background: color === 'multicolor' ? 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)' : undefined,
                  }}
                  title={color}
                ></button>
              ))}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 py-2 px-4 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
          >
            Add to Cart
          </button>
          
          <button
            onClick={handleBuyNow}
            className="flex-1 py-2 px-4 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
} 