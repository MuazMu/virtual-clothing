'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { useAppStore } from '@/lib/store';
import { alignClothingToAvatar, scaleAvatarByMeasurements, adjustClothingSize } from '@/lib/3d/avatar-utils';
import { AvatarModel, ClothingItem } from '@/lib/types';

// Model component for the avatar
function AvatarModel({ url, height, waist }: { url: string; height?: number; waist?: number }) {
  const [modelError, setModelError] = useState(false);
  const gltfResult = useLoader(
    GLTFLoader, 
    url,
    undefined,
    (error) => {
      console.error('Error loading model:', error);
      setModelError(true);
    }
  );
  
  const modelRef = useRef<THREE.Group>(null);
  
  useEffect(() => {
    if (modelRef.current) {
      // Scale the avatar based on user measurements
      scaleAvatarByMeasurements(modelRef.current, height, waist);
    }
  }, [modelRef, height, waist]);
  
  if (modelError) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    );
  }
  
  return (
    <primitive 
      ref={modelRef}
      object={gltfResult.scene} 
      position={[0, -1, 0]} 
      rotation={[0, 0, 0]} 
      scale={1} 
    />
  );
}

// Model component for clothing items
function ClothingModel({ 
  item, 
  avatarUrl, 
  size 
}: { 
  item: ClothingItem; 
  avatarUrl: string;
  size: string;
}) {
  const clothingRef = useRef<THREE.Group>(null);
  const avatarGltf = useLoader(GLTFLoader, avatarUrl);
  const clothingGltf = useLoader(GLTFLoader, item.model3d.url);
  
  useEffect(() => {
    if (clothingRef.current && avatarGltf.scene) {
      // Align clothing to avatar
      alignClothingToAvatar(avatarGltf.scene, clothingRef.current, item.type);
      
      // Adjust clothing size based on selected size
      adjustClothingSize(clothingRef.current, size);
    }
  }, [clothingRef, avatarGltf.scene, item.type, size]);
  
  return (
    <primitive 
      ref={clothingRef}
      object={clothingGltf.scene} 
      position={[0, 0, 0]} 
      rotation={[0, 0, 0]} 
      scale={1} 
    />
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#cccccc" wireframe />
    </mesh>
  );
}

// Main AvatarViewer component
export default function AvatarViewer() {
  const avatar = useAppStore((state) => state.avatar);
  const user = useAppStore((state) => state.user);
  const selectedClothing = useAppStore((state) => state.selectedClothing);
  
  const [isLoading, setIsLoading] = useState(true);
  
  // Convert selected clothing to array for rendering with safety checks
  const selectedClothingArray = selectedClothing && typeof selectedClothing === 'object'
    ? Object.values(selectedClothing).filter(Boolean) as ClothingItem[]
    : [];
  
  // Handle loading state
  useEffect(() => {
    if (avatar?.url) {
      setIsLoading(false);
    }
  }, [avatar]);
  
  if (!avatar || !avatar.url) {
    return (
      <div className="w-full h-96 flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No avatar available. Please upload a photo first.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        
        <Suspense fallback={<LoadingFallback />}>
          <Environment preset="city" />
          
          {/* Avatar model */}
          <AvatarModel 
            url={avatar.url} 
            height={user?.height}
            waist={user?.waist}
          />
          
          {/* Clothing models */}
          {Array.isArray(selectedClothingArray) && selectedClothingArray.map((item) => (
            <ClothingModel 
              key={item.id} 
              item={item} 
              avatarUrl={avatar.url}
              size={user?.size || 'M'}
            />
          ))}
        </Suspense>
        
        <OrbitControls 
          enablePan={false}
          minDistance={2}
          maxDistance={10}
          target={[0, 0, 0]}
        />
      </Canvas>
      
      <div className="absolute bottom-2 left-2 right-2 flex justify-center space-x-2 p-2 bg-white bg-opacity-70 rounded">
        <button 
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          onClick={() => {
            // Reset camera position
            // This would need to be implemented with a ref to the OrbitControls
          }}
        >
          Reset View
        </button>
      </div>
    </div>
  );
} 