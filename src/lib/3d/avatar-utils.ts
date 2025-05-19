import * as THREE from 'three';
import { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { ClothingItem } from '../types';

/**
 * Utility functions for handling 3D avatars and clothing
 */

/**
 * Aligns a clothing model to an avatar model
 */
export const alignClothingToAvatar = (
  avatar: THREE.Object3D,
  clothing: THREE.Object3D,
  type: ClothingItem['type']
): void => {
  // Different alignment logic based on clothing type
  switch (type) {
    case 'shirt':
      alignShirt(avatar, clothing);
      break;
    case 'pants':
      alignPants(avatar, clothing);
      break;
    case 'hijab':
      alignHijab(avatar, clothing);
      break;
    case 'shoes':
      alignShoes(avatar, clothing);
      break;
    case 'accessory':
      alignAccessory(avatar, clothing);
      break;
    default:
      console.warn(`Unknown clothing type: ${type}`);
  }
};

/**
 * Aligns a shirt to an avatar
 */
const alignShirt = (avatar: THREE.Object3D, shirt: THREE.Object3D): void => {
  // Find the torso bone in the avatar skeleton
  const torsoBone = findBoneByName(avatar, 'Spine');
  
  if (torsoBone) {
    // Position the shirt relative to the torso bone
    const torsoWorldPosition = new THREE.Vector3();
    torsoBone.getWorldPosition(torsoWorldPosition);
    
    shirt.position.copy(torsoWorldPosition);
    
    // You might need to adjust rotation and scale based on your models
    shirt.rotation.set(0, 0, 0);
    shirt.scale.set(1, 1, 1);
  } else {
    // Fallback if bone not found - approximate position
    shirt.position.set(0, 1.2, 0); // Adjust these values based on your avatar model
  }
};

/**
 * Aligns pants to an avatar
 */
const alignPants = (avatar: THREE.Object3D, pants: THREE.Object3D): void => {
  // Find the hip bone in the avatar skeleton
  const hipBone = findBoneByName(avatar, 'Hips');
  
  if (hipBone) {
    // Position the pants relative to the hip bone
    const hipWorldPosition = new THREE.Vector3();
    hipBone.getWorldPosition(hipWorldPosition);
    
    pants.position.copy(hipWorldPosition);
    
    // You might need to adjust rotation and scale based on your models
    pants.rotation.set(0, 0, 0);
    pants.scale.set(1, 1, 1);
  } else {
    // Fallback if bone not found - approximate position
    pants.position.set(0, 0.8, 0); // Adjust these values based on your avatar model
  }
};

/**
 * Aligns a hijab to an avatar
 */
const alignHijab = (avatar: THREE.Object3D, hijab: THREE.Object3D): void => {
  // Find the head bone in the avatar skeleton
  const headBone = findBoneByName(avatar, 'Head');
  
  if (headBone) {
    // Position the hijab relative to the head bone
    const headWorldPosition = new THREE.Vector3();
    headBone.getWorldPosition(headWorldPosition);
    
    hijab.position.copy(headWorldPosition);
    
    // You might need to adjust rotation and scale based on your models
    hijab.rotation.set(0, 0, 0);
    hijab.scale.set(1, 1, 1);
  } else {
    // Fallback if bone not found - approximate position
    hijab.position.set(0, 1.7, 0); // Adjust these values based on your avatar model
  }
};

/**
 * Aligns shoes to an avatar
 */
const alignShoes = (avatar: THREE.Object3D, shoes: THREE.Object3D): void => {
  // Find the feet bones in the avatar skeleton
  const leftFootBone = findBoneByName(avatar, 'LeftFoot');
  const rightFootBone = findBoneByName(avatar, 'RightFoot');
  
  if (leftFootBone && rightFootBone) {
    // For simplicity, we'll position at the midpoint between feet
    const leftFootWorldPosition = new THREE.Vector3();
    const rightFootWorldPosition = new THREE.Vector3();
    
    leftFootBone.getWorldPosition(leftFootWorldPosition);
    rightFootBone.getWorldPosition(rightFootWorldPosition);
    
    const midpoint = new THREE.Vector3().addVectors(
      leftFootWorldPosition, 
      rightFootWorldPosition
    ).multiplyScalar(0.5);
    
    shoes.position.copy(midpoint);
    
    // You might need to adjust rotation and scale based on your models
    shoes.rotation.set(0, 0, 0);
    shoes.scale.set(1, 1, 1);
  } else {
    // Fallback if bones not found - approximate position
    shoes.position.set(0, 0, 0); // Adjust these values based on your avatar model
  }
};

/**
 * Aligns an accessory to an avatar
 */
const alignAccessory = (avatar: THREE.Object3D, accessory: THREE.Object3D): void => {
  // This is generic - accessories could be anything (necklace, bracelet, etc.)
  // For simplicity, we'll position it at the center of the avatar
  accessory.position.set(0, 1, 0); // Adjust based on your avatar model
};

/**
 * Helper function to find a bone by name in a 3D model
 */
const findBoneByName = (object: THREE.Object3D, name: string): THREE.Object3D | null => {
  let result = null;
  
  object.traverse((child) => {
    if (child.name.includes(name)) {
      result = child;
    }
  });
  
  return result;
};

/**
 * Scales the avatar based on user measurements
 */
export const scaleAvatarByMeasurements = (
  avatar: THREE.Object3D,
  height?: number,
  waist?: number
): void => {
  // Default height in cm if not provided
  const defaultHeight = 170;
  
  if (height) {
    // Scale the entire avatar based on height
    // Assuming the default model is 170cm tall
    const scale = height / defaultHeight;
    avatar.scale.set(scale, scale, scale);
  }
  
  // Additional scaling for waist could be implemented if needed
  if (waist) {
    // This would require more complex mesh deformation
    // For simplicity, we're not implementing it here
  }
};

/**
 * Adjusts clothing size based on user measurements
 */
export const adjustClothingSize = (
  clothing: THREE.Object3D,
  size: string
): void => {
  // Scale factor based on size
  let scaleFactor = 1.0;
  
  switch (size.toUpperCase()) {
    case 'XS':
      scaleFactor = 0.9;
      break;
    case 'S':
      scaleFactor = 0.95;
      break;
    case 'M':
      scaleFactor = 1.0;
      break;
    case 'L':
      scaleFactor = 1.05;
      break;
    case 'XL':
      scaleFactor = 1.1;
      break;
    case 'XXL':
      scaleFactor = 1.15;
      break;
    default:
      scaleFactor = 1.0;
  }
  
  // Apply scaling
  clothing.scale.multiplyScalar(scaleFactor);
}; 