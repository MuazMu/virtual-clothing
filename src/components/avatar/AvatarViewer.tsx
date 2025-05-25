'use client';

import { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useAppStore } from '@/lib/store';
import { alignClothingToAvatar, scaleAvatarByMeasurements, adjustClothingSize } from '@/lib/3d/avatar-utils';
import type { AvatarModel, ClothingItem } from '@/lib/types';
import * as poseDetection from '@tensorflow-models/pose-detection';

// Define the connections between keypoints to form a skeleton using BlazePose indices
const skeletonConnections: [number, number][] = [
  // Face
  [0, 1], [1, 2], [2, 3], [3, 7], [0, 4], [4, 5], [5, 6], [6, 8], [9, 10],
  // Body
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left Arm
  [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],
  // Right Arm
  [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],
  // Left Leg
  [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],
  // Right Leg
  [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],
];

// Component to render the 3D pose skeleton
function PoseSkeleton({ keypoints }: { keypoints: poseDetection.Keypoint[] | null }) {
  const ref = useRef<THREE.Group>(null);

  if (!keypoints || keypoints.length === 0) {
    return null;
  }

  // Compute the center of the hips (indices 23 and 24)
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];
  let center = { x: 0, y: 0, z: 0 };
  if (
    leftHip && rightHip &&
    leftHip.x !== undefined && leftHip.y !== undefined && leftHip.z !== undefined &&
    rightHip.x !== undefined && rightHip.y !== undefined && rightHip.z !== undefined
  ) {
    center = {
      x: (leftHip.x + rightHip.x) / 2,
      y: (leftHip.y + rightHip.y) / 2,
      z: (leftHip.z + rightHip.z) / 2,
    };
  }

  // Create a group to hold the skeleton lines
  const skeletonGroup = new THREE.Group();

  // Draw lines for each connection, centering at the hips
  skeletonConnections.forEach(([i, j]: [number, number]) => {
    const start = keypoints[i];
    const end = keypoints[j];

    if (start && end && start.x !== undefined && start.y !== undefined && start.z !== undefined &&
        end.x !== undefined && end.y !== undefined && end.z !== undefined) {
      const points = [
        new THREE.Vector3(start.x - center.x, start.y - center.y, start.z - center.z),
        new THREE.Vector3(end.x - center.x, end.y - center.y, end.z - center.z),
      ];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const line = new THREE.Line(geometry, material);
      skeletonGroup.add(line);
    }
  });

  // Position the skeleton at the avatar's base
  skeletonGroup.position.set(0, -1, 0);

  return <primitive object={skeletonGroup} ref={ref} />;
}

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
  // Get skin color from the store
  const skinColor = useAppStore((state) => state.skinColor);
  
  const reconstructedFace = useAppStore((state) => state.reconstructedFace);
  
  useEffect(() => {
    if (modelRef.current) {
      // Scale the avatar based on user measurements
      scaleAvatarByMeasurements(modelRef.current, height, waist);
      // Apply skin color to the avatar's skin material
      if (skinColor) {
        modelRef.current.traverse((child: any) => {
          if (child.isMesh && child.material) {
            // Try to match material name to 'skin' (case-insensitive)
            if (child.material.name && child.material.name.toLowerCase().includes('skin')) {
              child.material.color = new THREE.Color(
                skinColor.r / 255,
                skinColor.g / 255,
                skinColor.b / 255
              );
              child.material.needsUpdate = true;
            }
          }
        });
      }
    }
  }, [modelRef, height, waist, skinColor]);
  
  useEffect(() => {
    if (reconstructedFace && modelRef.current) {
      // Use Three.js loaders (GLTFLoader, OBJLoader, etc.) to load meshUrl and textureUrl
      // Replace or blend the avatar's face mesh with the new mesh/texture
      // Example:
      // const loader = new OBJLoader();
      // loader.load(reconstructedFace.meshUrl, (obj) => {
      //   // Apply texture, add to scene, etc.
      // });
    }
  }, [reconstructedFace]);
  
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
  // Get pose3DKeypoints from the store
  const pose3DKeypoints = useAppStore((state) => state.pose3DKeypoints);
  
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
          
          {/* Add the PoseSkeleton component */}
          <PoseSkeleton keypoints={pose3DKeypoints} />
          
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