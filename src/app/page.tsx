'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { apiClient } from '@/lib/api/client';
import PhotoUpload from '@/components/avatar/PhotoUpload';
import AvatarViewer from '@/components/avatar/AvatarViewer';
import UserProfileForm from '@/components/ui/UserProfileForm';
import ClothingCatalog from '@/components/catalog/ClothingCatalog';

export default function Home() {
  const avatar = useAppStore((state) => state.avatar);
  const setCatalog = useAppStore((state) => state.setCatalog);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch catalog data on page load
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const result = await apiClient.getCatalog();
        
        if (result.success && result.data) {
          setCatalog(result.data);
        }
      } catch (error) {
        console.error('Error fetching catalog:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCatalog();
  }, [setCatalog]);
  
  return (
    <div className="space-y-8">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Virtual Clothing Try-On Experience
          </h1>
          <p className="text-lg md:text-xl mb-6">
            Upload your photo, create a 3D avatar, and try on clothes virtually before you buy.
          </p>
          <div className="flex justify-center space-x-4">
            <a 
              href="#upload"
              className="px-6 py-3 bg-white text-blue-600 rounded-md font-medium hover:bg-gray-100 transition-colors"
            >
              Get Started
            </a>
            <a 
              href="#catalog"
              className="px-6 py-3 bg-transparent border border-white text-white rounded-md font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Browse Catalog
            </a>
          </div>
        </div>
      </section>
      
      {/* Avatar creation section */}
      <section id="upload" className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4">Create Your Avatar</h2>
          <p className="text-gray-600 mb-6">
            Upload a full-body photo or use your webcam to create a 3D avatar. 
            Your photo will be processed securely and deleted after avatar creation.
          </p>
          <PhotoUpload />
        </div>
        
        <div>
          <h2 className="text-2xl font-bold mb-4">Your Avatar</h2>
          <p className="text-gray-600 mb-6">
            This is your 3D avatar. You can rotate it to view from different angles and try on clothes.
          </p>
          <AvatarViewer />
          
          <div className="mt-6">
            <UserProfileForm />
          </div>
        </div>
      </section>
      
      {/* Featured catalog section */}
      <section id="catalog" className="pt-4">
        <h2 className="text-2xl font-bold mb-4">Featured Items</h2>
        <p className="text-gray-600 mb-6">
          Try on these featured items on your avatar. Click "Try On" to see how they look on you.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <ClothingCatalog />
        )}
        
        <div className="mt-8 text-center">
          <a 
            href="/catalog"
            className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            View Full Catalog
          </a>
        </div>
      </section>
      
      {/* How it works section */}
      <section className="bg-gray-100 rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold">1</div>
            <h3 className="text-lg font-semibold mb-2">Upload Your Photo</h3>
            <p className="text-gray-600">
              Upload a full-body photo or use your webcam to create a 3D avatar of yourself.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold">2</div>
            <h3 className="text-lg font-semibold mb-2">Try On Clothes</h3>
            <p className="text-gray-600">
              Browse our catalog and try on different clothes to see how they look on your avatar.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 text-xl font-bold">3</div>
            <h3 className="text-lg font-semibold mb-2">Shop with Confidence</h3>
            <p className="text-gray-600">
              When you find something you like, purchase it directly from our partner stores.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
