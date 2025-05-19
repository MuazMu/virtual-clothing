'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api/client';
import ClothingCatalog from '@/components/catalog/ClothingCatalog';
import AvatarViewer from '@/components/avatar/AvatarViewer';

export default function CatalogPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const avatar = useAppStore((state) => state.avatar);
  const setCatalog = useAppStore((state) => state.setCatalog);
  const selectedClothing = useAppStore((state) => state.selectedClothing);
  
  // Check if any clothing is selected
  const hasSelectedClothing = Object.values(selectedClothing).some(Boolean);
  
  // Fetch catalog data
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = await apiClient.getCatalog();
        
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
  }, [setCatalog]);
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clothing Catalog</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Catalog section */}
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-100 p-4 rounded-lg text-red-700 mb-6">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <ClothingCatalog />
          )}
        </div>
        
        {/* Avatar preview section */}
        <div className="lg:sticky lg:top-8 space-y-4">
          <h2 className="text-xl font-semibold">Preview</h2>
          
          {!avatar ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <p className="text-gray-500 mb-4">
                You haven't created an avatar yet.
              </p>
              <a
                href="/#upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Avatar
              </a>
            </div>
          ) : (
            <>
              <AvatarViewer />
              
              {hasSelectedClothing && (
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium mb-2">Selected Items</h3>
                  <ul className="space-y-2">
                    {Object.entries(selectedClothing).map(([type, item]) => 
                      item && (
                        <li key={item.id} className="flex justify-between items-center">
                          <span className="capitalize">{type}:</span>
                          <span className="font-medium">{item.name}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 