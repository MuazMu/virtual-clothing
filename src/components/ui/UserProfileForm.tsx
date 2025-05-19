'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { User } from '@/lib/types';

export default function UserProfileForm() {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);
  
  const [formData, setFormData] = useState<User>({
    height: user?.height || undefined,
    waist: user?.waist || undefined,
    size: user?.size || 'M',
  });
  
  const [isEditing, setIsEditing] = useState(!user);
  
  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        height: user.height,
        waist: user.waist,
        size: user.size || 'M',
      });
    }
  }, [user]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save user data to store
    setUser({
      ...user,
      ...formData,
    });
    
    setIsEditing(false);
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'height' || name === 'waist' ? Number(value) || undefined : value,
    }));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Measurements</h2>
        
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
        )}
      </div>
      
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                id="height"
                name="height"
                value={formData.height || ''}
                onChange={handleChange}
                placeholder="Enter your height in cm"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="waist" className="block text-sm font-medium text-gray-700 mb-1">
                Waist (cm)
              </label>
              <input
                type="number"
                id="waist"
                name="waist"
                value={formData.waist || ''}
                onChange={handleChange}
                placeholder="Enter your waist measurement in cm"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-1">
                Standard Size
              </label>
              <select
                id="size"
                name="size"
                value={formData.size || 'M'}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            
            <div className="flex space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    height: user?.height,
                    waist: user?.waist,
                    size: user?.size || 'M',
                  });
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Height:</span>
            <span className="font-medium">
              {user?.height ? `${user.height} cm` : 'Not specified'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Waist:</span>
            <span className="font-medium">
              {user?.waist ? `${user.waist} cm` : 'Not specified'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-600">Standard Size:</span>
            <span className="font-medium">
              {user?.size || 'M'}
            </span>
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            These measurements help us provide better fit recommendations for clothing items.
          </p>
        </div>
      )}
    </div>
  );
} 