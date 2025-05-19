import { NextRequest, NextResponse } from 'next/server';
import { ClothingItem } from '@/lib/types';

// Sample clothing catalog for demo purposes
// In a real application, this would come from a database or external API
const clothingCatalog: ClothingItem[] = [
  {
    id: '1',
    name: 'Classic White Shirt',
    description: 'A timeless white button-up shirt that goes with everything',
    type: 'shirt',
    images: {
      thumbnail: '/images/clothing/white-shirt-thumb.jpg',
      full: '/images/clothing/white-shirt-full.jpg',
    },
    model3d: {
      url: '/models/clothing/white-shirt.glb',
      format: 'glb',
    },
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['white'],
    price: 29.99,
    currency: 'USD',
    affiliateLink: 'https://example.com/shop/white-shirt',
    store: 'Example Store',
  },
  {
    id: '2',
    name: 'Black Slim-Fit Pants',
    description: 'Elegant black pants with a modern slim fit',
    type: 'pants',
    images: {
      thumbnail: '/images/clothing/black-pants-thumb.jpg',
      full: '/images/clothing/black-pants-full.jpg',
    },
    model3d: {
      url: '/models/clothing/black-pants.glb',
      format: 'glb',
    },
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['black'],
    price: 39.99,
    currency: 'USD',
    affiliateLink: 'https://example.com/shop/black-pants',
    store: 'Example Store',
  },
  {
    id: '3',
    name: 'Blue Hijab',
    description: 'Beautiful blue hijab made from premium fabric',
    type: 'hijab',
    images: {
      thumbnail: '/images/clothing/blue-hijab-thumb.jpg',
      full: '/images/clothing/blue-hijab-full.jpg',
    },
    model3d: {
      url: '/models/clothing/blue-hijab.glb',
      format: 'glb',
    },
    sizes: ['One Size'],
    colors: ['blue'],
    price: 24.99,
    currency: 'USD',
    affiliateLink: 'https://example.com/shop/blue-hijab',
    store: 'Example Store',
  },
  {
    id: '4',
    name: 'Casual Sneakers',
    description: 'Comfortable sneakers for everyday wear',
    type: 'shoes',
    images: {
      thumbnail: '/images/clothing/sneakers-thumb.jpg',
      full: '/images/clothing/sneakers-full.jpg',
    },
    model3d: {
      url: '/models/clothing/sneakers.glb',
      format: 'glb',
    },
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    colors: ['white', 'black'],
    price: 59.99,
    currency: 'USD',
    affiliateLink: 'https://example.com/shop/sneakers',
    store: 'Example Store',
  },
  {
    id: '5',
    name: 'Silver Necklace',
    description: 'Elegant silver necklace with minimalist design',
    type: 'accessory',
    images: {
      thumbnail: '/images/clothing/necklace-thumb.jpg',
      full: '/images/clothing/necklace-full.jpg',
    },
    model3d: {
      url: '/models/clothing/necklace.glb',
      format: 'glb',
    },
    sizes: ['One Size'],
    colors: ['silver'],
    price: 45.99,
    currency: 'USD',
    affiliateLink: 'https://example.com/shop/necklace',
    store: 'Example Store',
  },
  {
    id: '6',
    name: 'Floral Shirt',
    description: 'Vibrant floral pattern shirt for a bold look',
    type: 'shirt',
    images: {
      thumbnail: '/images/clothing/floral-shirt-thumb.jpg',
      full: '/images/clothing/floral-shirt-full.jpg',
    },
    model3d: {
      url: '/models/clothing/floral-shirt.glb',
      format: 'glb',
    },
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['multicolor'],
    price: 34.99,
    currency: 'USD',
    affiliateLink: 'https://example.com/shop/floral-shirt',
    store: 'Trendy Fashion',
  },
  {
    id: '7',
    name: 'Denim Jeans',
    description: 'Classic blue denim jeans with straight fit',
    type: 'pants',
    images: {
      thumbnail: '/images/clothing/jeans-thumb.jpg',
      full: '/images/clothing/jeans-full.jpg',
    },
    model3d: {
      url: '/models/clothing/jeans.glb',
      format: 'glb',
    },
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['blue'],
    price: 49.99,
    currency: 'USD',
    affiliateLink: 'https://example.com/shop/jeans',
    store: 'Denim Co.',
  },
  {
    id: '8',
    name: 'Patterned Hijab',
    description: 'Stylish hijab with geometric patterns',
    type: 'hijab',
    images: {
      thumbnail: '/images/clothing/patterned-hijab-thumb.jpg',
      full: '/images/clothing/patterned-hijab-full.jpg',
    },
    model3d: {
      url: '/models/clothing/patterned-hijab.glb',
      format: 'glb',
    },
    sizes: ['One Size'],
    colors: ['multicolor'],
    price: 29.99,
    currency: 'USD',
    affiliateLink: 'https://example.com/shop/patterned-hijab',
    store: 'Modanisa',
  },
];

/**
 * GET handler for the catalog
 * Returns all clothing items or filters by type/store
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const store = searchParams.get('store');
    
    let filteredItems = [...clothingCatalog];
    
    // Apply type filter if provided
    if (type) {
      filteredItems = filteredItems.filter(item => item.type === type);
    }
    
    // Apply store filter if provided
    if (store) {
      filteredItems = filteredItems.filter(
        item => item.store.toLowerCase() === store.toLowerCase()
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: filteredItems 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch catalog' },
      { status: 500 }
    );
  }
}

/**
 * Dynamic route handler for getting a specific item by ID
 */
export async function getItemById(id: string): Promise<ClothingItem | undefined> {
  return clothingCatalog.find(item => item.id === id);
} 