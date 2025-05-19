import { AvatarModel, ApiResponse, ClothingItem, ChatMessage } from '../types';

/**
 * API client for communicating with backend services
 */
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  }

  /**
   * Helper method for making API requests
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'An unknown error occurred',
        };
      }

      return {
        success: true,
        data: data as T,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      };
    }
  }

  /**
   * Upload a user photo to generate a 3D avatar
   */
  async uploadUserPhoto(
    photo: File | Blob | string
  ): Promise<ApiResponse<AvatarModel>> {
    const formData = new FormData();
    
    if (typeof photo === 'string') {
      // If photo is a base64 string, convert it to a blob
      const response = await fetch(photo);
      const blob = await response.blob();
      formData.append('photo', blob, 'user-photo.jpg');
    } else {
      formData.append('photo', photo);
    }

    return this.request<AvatarModel>('/api/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Remove Content-Type header to let browser set it with boundary
    });
  }

  /**
   * Get the status of avatar generation
   */
  async getAvatarStatus(avatarId: string): Promise<ApiResponse<AvatarModel>> {
    return this.request<AvatarModel>(`/api/avatar/${avatarId}`);
  }

  /**
   * Get clothing catalog
   */
  async getCatalog(
    filters?: { type?: string; store?: string }
  ): Promise<ApiResponse<ClothingItem[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters?.type) {
      queryParams.append('type', filters.type);
    }
    
    if (filters?.store) {
      queryParams.append('store', filters.store);
    }
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    return this.request<ClothingItem[]>(`/api/catalog${query}`);
  }

  /**
   * Get a specific clothing item
   */
  async getClothingItem(itemId: string): Promise<ApiResponse<ClothingItem>> {
    return this.request<ClothingItem>(`/api/catalog/${itemId}`);
  }

  /**
   * Send a message to the AI fashion advisor
   */
  async sendChatMessage(
    message: string,
    history: ChatMessage[]
  ): Promise<ApiResponse<ChatMessage>> {
    return this.request<ChatMessage>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        history,
      }),
    });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient(); 