'use client';

import { useState, useEffect } from 'react';
import { ClothingItem } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api/client';
import ClothingCard from '../clothing/ClothingCard';

interface ClothingCatalogProps {
  initialItems?: ClothingItem[];
  initialFilter?: {
    type?: string;
    store?: string;
  };
}

export default function ClothingCatalog({ 
  initialItems,
  initialFilter 
}: ClothingCatalogProps) {
  const [isLoading, setIsLoading] = useState(!initialItems);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState(initialFilter || {});
  
  const catalog = useAppStore((state) => state.catalog);
  const setCatalog = useAppStore((state) => state.setCatalog);
  
  // Fetch catalog data
  useEffect(() => {
    if (initialItems) {
      setCatalog(initialItems);
      return;
    }
    
    const fetchCatalog = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiClient.getCatalog(activeFilter);
        
        if (result.success && result.data) {
          setCatalog(result.data);
        } else {
          setError(result.error || 'Failed to fetch catalog');
        }
      } catch (err) {
        setError('An error occurred while fetching the catalog');
        console.error('Catalog fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCatalog();
  }, [initialItems, setCatalog, activeFilter]);
  
  // Filter types
  const clothingTypes: ClothingItem['type'][] = [
    'shirt', 
    'pants', 
    'hijab', 
    'shoes', 
    'accessory'
  ];
  
  // Get unique stores from catalog
  const stores = Array.from(
    new Set(catalog.map((item) => item.store))
  ).sort();
  
  // Handle filter changes
  const handleTypeFilter = (type: ClothingItem['type'] | undefined) => {
    setActiveFilter((prev) => ({
      ...prev,
      type: prev.type === type ? undefined : type,
    }));
  };
  
  const handleStoreFilter = (store: string | undefined) => {
    setActiveFilter((prev) => ({
      ...prev,
      store: prev.store === store ? undefined : store,
    }));
  };
  
  const clearFilters = () => {
    setActiveFilter({});
  };
  
  // Filter items based on active filters (client-side filtering for initial items)
  const filteredItems = initialItems
    ? catalog.filter((item) => {
        const typeMatch = !activeFilter.type || item.type === activeFilter.type;
        const storeMatch = !activeFilter.store || item.store === activeFilter.store;
        return typeMatch && storeMatch;
      })
    : catalog;
  
  return (
    <div className="w-full">
      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        
        <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
          {/* Type filters */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Type</h3>
            <div className="flex flex-wrap gap-2">
              {clothingTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeFilter(type)}
                  className={`px-3 py-1 text-sm rounded-md capitalize ${
                    activeFilter.type === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          
          {/* Store filters */}
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Store</h3>
            <div className="flex flex-wrap gap-2">
              {stores.map((store) => (
                <button
                  key={store}
                  onClick={() => handleStoreFilter(store)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    activeFilter.store === store
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {store}
                </button>
              ))}
            </div>
          </div>
          
          {/* Clear filters */}
          {(activeFilter.type || activeFilter.store) && (
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Error state */}
      {error && (
        <div className="bg-red-100 p-4 rounded-lg text-red-700 mb-6">
          {error}
        </div>
      )}
      
      {/* Empty state */}
      {!isLoading && !error && filteredItems.length === 0 && (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No items found</h3>
          <p className="text-gray-500">
            Try changing your filters or check back later for new items.
          </p>
        </div>
      )}
      
      {/* Catalog grid */}
      {!isLoading && !error && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <ClothingCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
} 