import { apiClient } from './client';
import { ApiResponse, DonorProfile } from '../types';

export const donorsApi = {
  async searchDonors(params: {
    bloodGroup?: string;
    city?: string;
    state?: string;
    availability?: boolean;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<DonorProfile[]>> {
    const res = await apiClient.get('/donors/search', { params });
    return res.data;
  },

  async getPublicProfile(id: string): Promise<ApiResponse<DonorProfile>> {
    const res = await apiClient.get(`/donors/${id}/public`);
    return res.data;
  },

  async getMyProfile(): Promise<ApiResponse<DonorProfile>> {
    const res = await apiClient.get('/donors/profile');
    return res.data;
  },

  async createProfile(data: {
    bloodGroup: string;
    dateOfBirth: string;
    gender: string;
    preferredContact: string;
    city?: string;
    state?: string;
    area?: string;
    pincode?: string;
  }): Promise<ApiResponse<DonorProfile>> {
    const res = await apiClient.post('/donors/profile', data);
    return res.data;
  },

  async updateProfile(data: Partial<{
    bloodGroup: string;
    preferredContact: string;
    city?: string;
    state?: string;
    area?: string;
    pincode?: string;
  }>): Promise<ApiResponse<DonorProfile>> {
    const res = await apiClient.put('/donors/profile', data);
    return res.data;
  },

  async updateAvailability(availability: boolean): Promise<ApiResponse<{ availability: boolean }>> {
    const res = await apiClient.put('/donors/availability', { availability });
    return res.data;
  },
};
