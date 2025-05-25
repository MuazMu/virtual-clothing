/**
 * Utility functions for handling images in the virtual clothing application
 */

// Maximum file size in bytes (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed image file types
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Validates an image file based on size and type
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds the maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`,
    };
  }

  return { valid: true };
};

/**
 * Converts a File object to a base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Resizes an image to the specified dimensions
 */
export const resizeImage = (
  file: File,
  maxWidth: number,
  maxHeight: number
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create blob from canvas'));
          }
        },
        file.type,
        0.9 // Quality
      );
      
      // Clean up
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Error loading image'));
    };
  });
};

/**
 * Extracts the average color from a region of an image using a segmentation mask.
 * @param image HTMLImageElement or HTMLCanvasElement
 * @param mask Uint8ClampedArray or ImageData (same size as image)
 * @param regionValue The value in the mask corresponding to the region (e.g., face or hair)
 * @returns { r: number, g: number, b: number } Average color
 */
export function extractAverageColorFromMask(
  image: HTMLImageElement | HTMLCanvasElement,
  mask: Uint8ClampedArray | ImageData,
  regionValue: number
): { r: number; g: number; b: number } | null {
  // Draw image to canvas if needed
  let canvas: HTMLCanvasElement;
  if (image instanceof HTMLCanvasElement) {
    canvas = image;
  } else {
    canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(image, 0, 0);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  // Get mask data
  let maskData: Uint8ClampedArray;
  if (mask instanceof ImageData) {
    maskData = mask.data;
  } else {
    maskData = mask;
  }

  let r = 0, g = 0, b = 0, count = 0;
  for (let i = 0; i < maskData.length; i++) {
    if (maskData[i] === regionValue) {
      r += data[i * 4];
      g += data[i * 4 + 1];
      b += data[i * 4 + 2];
      count++;
    }
  }
  if (count === 0) return null;
  return {
    r: Math.round(r / count),
    g: Math.round(g / count),
    b: Math.round(b / count),
  };
} 