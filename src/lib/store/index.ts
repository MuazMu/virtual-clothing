import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  AvatarModel, 
  ClothingItem, 
  CartItem, 
  FavoriteItem,
  ChatMessage
} from '../types';
import * as poseDetection from '@tensorflow-models/pose-detection';

interface AppState {
  // User and Avatar
  user: User | null;
  avatar: AvatarModel | null;
  setUser: (user: User | null) => void;
  setAvatar: (avatar: AvatarModel | null) => void;
  
  // Add state for 3D pose keypoints
  pose3DKeypoints: poseDetection.Keypoint[] | null;
  setPose3DKeypoints: (keypoints: poseDetection.Keypoint[] | null) => void;
  
  // Add state for skin and hair color
  skinColor: { r: number; g: number; b: number } | null;
  setSkinColor: (color: { r: number; g: number; b: number } | null) => void;
  hairColor: { r: number; g: number; b: number } | null;
  setHairColor: (color: { r: number; g: number; b: number } | null) => void;
  
  // Clothing items
  catalog: ClothingItem[];
  setCatalog: (items: ClothingItem[]) => void;
  
  // Currently selected clothing
  selectedClothing: {
    shirt?: ClothingItem;
    pants?: ClothingItem;
    hijab?: ClothingItem;
    shoes?: ClothingItem;
    accessory?: ClothingItem;
  };
  selectClothing: (type: ClothingItem['type'], item: ClothingItem | undefined) => void;
  clearSelectedClothing: () => void;
  
  // Cart
  cart: CartItem[];
  addToCart: (item: ClothingItem, size: string, color: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Favorites
  favorites: FavoriteItem[];
  addToFavorites: (item: ClothingItem) => void;
  removeFromFavorites: (itemId: string) => void;
  
  // Chat
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChatMessages: () => void;
  
  // Reconstructed face
  reconstructedFace: { meshUrl: string; textureUrl: string } | null;
  setReconstructedFace: (data: { meshUrl: string; textureUrl: string } | null) => void;
}

// Default state with properly initialized arrays
const defaultState = {
  user: null,
  avatar: null,
  catalog: [],
  selectedClothing: {},
  cart: [],
  favorites: [],
  chatMessages: [],
  // Initialize pose3DKeypoints
  pose3DKeypoints: null,
  // Add default skin and hair color
  skinColor: null,
  hairColor: null,
  reconstructedFace: null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Initialize with default state
      ...defaultState,
      
      // User and Avatar
      setUser: (user) => set({ user }),
      setAvatar: (avatar) => set({ avatar }),
      
      // Set 3D pose keypoints
      setPose3DKeypoints: (keypoints) => set({ pose3DKeypoints: keypoints }),
      
      // Set skin and hair color
      setSkinColor: (color) => set({ skinColor: color }),
      setHairColor: (color) => set({ hairColor: color }),
      
      // Clothing items
      setCatalog: (items) => set({ catalog: Array.isArray(items) ? items : [] }),
      
      // Currently selected clothing
      selectClothing: (type, item) => set((state) => ({
        selectedClothing: {
          ...state.selectedClothing,
          [type]: item
        }
      })),
      clearSelectedClothing: () => set({ selectedClothing: {} }),
      
      // Cart
      addToCart: (item, size, color, quantity) => set((state) => {
        const cart = Array.isArray(state.cart) ? state.cart : [];
        const existingItemIndex = cart.findIndex(
          (cartItem) => cartItem.item.id === item.id && 
                        cartItem.selectedSize === size && 
                        cartItem.selectedColor === color
        );
        
        if (existingItemIndex >= 0) {
          const updatedCart = [...cart];
          updatedCart[existingItemIndex].quantity += quantity;
          return { cart: updatedCart };
        } else {
          return { 
            cart: [...cart, { item, selectedSize: size, selectedColor: color, quantity }] 
          };
        }
      }),
      removeFromCart: (itemId) => set((state) => ({
        cart: Array.isArray(state.cart) 
          ? state.cart.filter((item) => item.item.id !== itemId)
          : []
      })),
      updateCartItemQuantity: (itemId, quantity) => set((state) => ({
        cart: Array.isArray(state.cart)
          ? state.cart.map((item) => 
              item.item.id === itemId ? { ...item, quantity } : item
            )
          : []
      })),
      clearCart: () => set({ cart: [] }),
      
      // Favorites
      addToFavorites: (item) => set((state) => {
        const favorites = Array.isArray(state.favorites) ? state.favorites : [];
        const existingItem = favorites.find(
          (favItem) => favItem.item.id === item.id
        );
        
        if (!existingItem) {
          return { 
            favorites: [...favorites, { item, addedAt: new Date() }] 
          };
        }
        return { favorites };
      }),
      removeFromFavorites: (itemId) => set((state) => ({
        favorites: Array.isArray(state.favorites) 
          ? state.favorites.filter((item) => item.item.id !== itemId)
          : []
      })),
      
      // Chat
      chatMessages: [],
      addChatMessage: (message) => set((state) => ({
        chatMessages: Array.isArray(state.chatMessages) 
          ? [...state.chatMessages, { 
              ...message, 
              suggestions: Array.isArray(message.suggestions) ? message.suggestions : [] 
            }]
          : [{ 
              ...message, 
              suggestions: Array.isArray(message.suggestions) ? message.suggestions : [] 
            }]
      })),
      clearChatMessages: () => set({ chatMessages: [] }),
      
      // Reconstructed face
      setReconstructedFace: (data) => set({ reconstructedFace: data }),
    }),
    {
      name: 'virtual-clothing-store',
      skipHydration: true,
    }
  )
); 