'use client';

import { useState, useRef } from 'react';
import { validateImage, fileToBase64, resizeImage } from '@/lib/utils/image-utils';
import { apiClient } from '@/lib/api/client';
import { useAppStore } from '@/lib/store';

export default function PhotoUpload() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const setAvatar = useAppStore((state) => state.setAvatar);
  
  // Start webcam capture
  const startCapture = async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
      }
    } catch (err) {
      setError('Could not access camera. Please allow camera access or upload a photo instead.');
      console.error('Error accessing camera:', err);
    }
  };
  
  // Stop webcam capture
  const stopCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
    }
  };
  
  // Capture photo from webcam
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPreviewUrl(dataUrl);
        
        // Stop the webcam
        stopCapture();
      }
    }
  };
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate the image
    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid image');
      return;
    }
    
    // Create preview
    const base64 = await fileToBase64(file);
    setPreviewUrl(base64);
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // Upload photo to generate avatar
  const uploadPhoto = async () => {
    if (!previewUrl) return;
    
    setIsLoading(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Convert data URL to blob if needed
      let photoData: Blob | string = previewUrl;
      
      if (previewUrl.startsWith('data:')) {
        const response = await fetch(previewUrl);
        photoData = await response.blob();
        
        // Resize the image if it's too large
        photoData = await resizeImage(photoData as File, 1024, 1024);
      }
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Upload to API
      const result = await apiClient.uploadUserPhoto(photoData);
      
      clearInterval(progressInterval);
      
      if (result.success && result.data) {
        setUploadProgress(100);
        setAvatar(result.data);
        
        // In a real app, you might want to poll for status updates
        // if the avatar generation is asynchronous
      } else {
        setError(result.error || 'Failed to generate avatar');
        setUploadProgress(0);
      }
    } catch (err) {
      setError('An error occurred while uploading the photo');
      console.error('Upload error:', err);
      setUploadProgress(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setPreviewUrl(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Create Your Avatar</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {!isCapturing && !previewUrl && (
        <div className="flex flex-col space-y-4">
          <button
            onClick={startCapture}
            className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Use Camera
          </button>
          
          <div className="text-center my-2">or</div>
          
          <button
            onClick={triggerFileInput}
            className="py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Upload Photo
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      )}
      
      {isCapturing && (
        <div className="flex flex-col space-y-4">
          <div className="relative w-full aspect-[3/4] bg-black rounded-md overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={capturePhoto}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Capture
            </button>
            
            <button
              onClick={stopCapture}
              className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {previewUrl && (
        <div className="flex flex-col space-y-4">
          <div className="relative w-full aspect-[3/4] bg-black rounded-md overflow-hidden">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          
          {uploadProgress > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
          
          <div className="flex space-x-2">
            {!isLoading && uploadProgress === 0 && (
              <>
                <button
                  onClick={uploadPhoto}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Generate Avatar
                </button>
                
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              </>
            )}
            
            {isLoading && (
              <button
                disabled
                className="flex-1 py-2 px-4 bg-blue-400 text-white rounded-md cursor-not-allowed"
              >
                Processing...
              </button>
            )}
            
            {!isLoading && uploadProgress === 100 && (
              <button
                onClick={resetForm}
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Done! Try Another?
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Hidden canvas for capturing photos */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 