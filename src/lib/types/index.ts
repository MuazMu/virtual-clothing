export interface User {
  id?: string;
  height?: number; // in cm
  waist?: number; // in cm
  size?: string; // S, M, L, XL, etc.
}

export interface AvatarModel {
  id: string;
  url: string;
  format: '3d' | 'glb' | 'gltf';
  userId?: string;
  createdAt: Date;
}

export interface ClothingItem {
  id: string;
  name: string;
  description: string;
  type: 'shirt' | 'pants' | 'hijab' | 'shoes' | 'accessory';
  images: {
    thumbnail: string;
    full: string;
  };
  model3d: {
    url: string;
    format: '3d' | 'glb' | 'gltf';
  };
  sizes: string[]; // S, M, L, XL, etc.
  colors: string[];
  price: number;
  currency: string;
  affiliateLink: string;
  store: string;
}

export interface CartItem {
  item: ClothingItem;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface FavoriteItem {
  item: ClothingItem;
  addedAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: ClothingItem[];
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 