import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { AvatarModel } from '@/lib/types';

// In a real application, this would be stored in a database
// For simplicity, we're using an in-memory store with demo models
const avatarJobs: Record<string, AvatarModel> = {};

// Demo GLB avatar models (replace with your own public models if needed)
const demoAvatarModels = [
  'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/casual-female-outfit-1/casual-female-outfit-1.glb',
  'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/casual-male-outfit-1/casual-male-outfit-1.glb',
  'https://market-assets.fra1.cdn.digitaloceanspaces.com/market-assets/models/female-sport-outfit/female-sport-outfit.glb'
];

// Maximum request body size for Vercel serverless functions
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb',
    },
  },
};

/**
 * POST handler for avatar generation
 * Accepts a user photo and simulates the 3D avatar generation process
 */
export async function POST(request: NextRequest) {
  try {
    // In production we'd actually process the image
    // For this demo, we'll just return a pre-made avatar model
    
    // Generate a unique ID for this job
    const jobId = uuidv4();
    
    // Select a random demo model
    const randomModelUrl = demoAvatarModels[Math.floor(Math.random() * demoAvatarModels.length)];
    
    // Store job in our in-memory database with immediate result
    const avatarModel: AvatarModel = {
      id: jobId,
      url: randomModelUrl,
      format: 'glb',
      createdAt: new Date(),
    };
    
    avatarJobs[jobId] = avatarModel;
    
    return NextResponse.json(
      { 
        success: true, 
        data: avatarModel
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing avatar request:', error);
    return NextResponse.json(
      { error: 'Failed to process avatar generation request' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for checking avatar generation status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Avatar ID is required' },
        { status: 400 }
      );
    }
    
    const avatar = avatarJobs[id];
    
    if (!avatar) {
      return NextResponse.json(
        { error: 'Avatar not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { 
        success: true, 
        data: avatar 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching avatar status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch avatar status' },
      { status: 500 }
    );
  }
} 