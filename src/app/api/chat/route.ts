import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage, ClothingItem } from '@/lib/types';
import OpenAI from 'openai';

// Sample clothing items for demo purposes
// In a real application, these would come from a database
const sampleClothingItems: ClothingItem[] = [
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
];

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY || '',
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
    'X-Title': 'Virtual Clothing Try-On',
  },
});

/**
 * POST handler for chat messages
 * Accepts a user message and chat history, then returns an AI response
 */
export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Format the conversation history for the AI
    const formattedHistory = history.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
    }));
    
    // Add the new user message
    formattedHistory.push({
      role: 'user',
      content: message,
    });
    
    // Call OpenRouter API (using Gemini 2.5 Pro)
    const response = await openai.chat.completions.create({
      model: 'google/gemini-2.5-pro-experimental',
      messages: formattedHistory,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
      // Include a system message to guide the AI's responses
      system: `You are a helpful fashion advisor. Provide styling advice and suggest specific items from our catalog.
      When suggesting items, include them in a 'suggestions' array in your JSON response.
      Each suggestion should include the item's id, name, and type.
      Base your suggestions on these available items: ${JSON.stringify(sampleClothingItems)}`,
    });
    
    // Parse the AI response
    const aiContent = response.choices[0]?.message?.content || '';
    let suggestions: ClothingItem[] = [];
    
    try {
      // Extract suggestions from the AI response
      const parsedResponse = JSON.parse(aiContent);
      
      if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
        // Find the suggested items in our catalog
        suggestions = parsedResponse.suggestions
          .map((suggestion: any) => {
            return sampleClothingItems.find(item => 
              item.id === suggestion.id || 
              item.name.toLowerCase() === suggestion.name.toLowerCase()
            );
          })
          .filter(Boolean);
      }
      
      // Create the assistant message
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: parsedResponse.content || aiContent,
        timestamp: new Date(),
        suggestions,
      };
      
      return NextResponse.json(
        { 
          success: true, 
          data: assistantMessage 
        },
        { status: 200 }
      );
    } catch (parseError) {
      // If parsing fails, return the raw AI response
      const assistantMessage: ChatMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
      };
      
      return NextResponse.json(
        { 
          success: true, 
          data: assistantMessage 
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
} 