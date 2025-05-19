'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';

export default function CartPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  const cart = useAppStore((state) => state.cart || []);
  const removeFromCart = useAppStore((state) => state.removeFromCart);
  const updateCartItemQuantity = useAppStore((state) => state.updateCartItemQuantity);
  const clearCart = useAppStore((state) => state.clearCart);
  
  // Calculate total price with safety check
  const totalPrice = Array.isArray(cart) ? cart.reduce(
    (sum, item) => sum + item.item.price * item.quantity,
    0
  ) : 0;
  
  // Handle quantity change
  const handleQuantityChange = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    updateCartItemQuantity(itemId, quantity);
  };
  
  // Handle checkout
  const handleCheckout = () => {
    // In a real app, this would redirect to a checkout page
    // For now, we'll just open the first item's affiliate link
    if (cart.length > 0) {
      window.open(cart[0].item.affiliateLink, '_blank');
    }
  };
  
  return (
    <>
      {/* Cart button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
      >
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          
          {cart.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
        </div>
      </button>
      
      {/* Cart panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Your Cart</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!Array.isArray(cart) || cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p>Your cart is empty</p>
                  <p className="text-sm mt-2">Add items to your cart to see them here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={`${item.item.id}-${item.selectedSize}-${item.selectedColor}`} className="flex border rounded-lg overflow-hidden">
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-100 flex-shrink-0">
                        <img 
                          src={item.item.images.thumbnail} 
                          alt={item.item.name}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 p-3">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.item.name}</h3>
                          <button 
                            onClick={() => removeFromCart(item.item.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className="text-sm text-gray-600 mt-1">
                          <p>Size: {item.selectedSize}</p>
                          <p>Color: {item.selectedColor}</p>
                        </div>
                        
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border rounded-md">
                            <button 
                              onClick={() => handleQuantityChange(item.item.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                              disabled={item.quantity <= 1}
                            >
                              -
                            </button>
                            <span className="px-2 py-1">{item.quantity}</span>
                            <button 
                              onClick={() => handleQuantityChange(item.item.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                            >
                              +
                            </button>
                          </div>
                          
                          <div className="font-semibold">
                            {(item.item.price * item.quantity).toFixed(2)} {item.item.currency}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t">
              {Array.isArray(cart) && cart.length > 0 && (
                <>
                  <div className="flex justify-between mb-4">
                    <span className="font-semibold">Total:</span>
                    <span className="font-bold text-lg">
                      {totalPrice.toFixed(2)} {cart[0]?.item.currency || 'USD'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={clearCart}
                      className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Clear Cart
                    </button>
                    
                    <button
                      onClick={handleCheckout}
                      className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 