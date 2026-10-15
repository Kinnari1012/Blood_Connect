import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface DonationRecord {
  id: string;
  _id?: string;
  userId?: string;
  requestId?: string;
  hospital?: string;
  hospitalName?: string;
  location?: string;
  city?: string;
  bloodGroup: string;
  units: number;
  unitsRequired?: number;
  type?: string;
  donationType?: string;
  status: string;
  date?: string;
  createdAt: string;
}

export const donationsApi = {
  async getMyDonations(): Promise<ApiResponse<DonationRecord[]>> {
    const res = await apiClient.get('/donations/my');
    return res.data;
  },

  async getAllDonations(params?: { page?: number; limit?: number }): Promise<ApiResponse<DonationRecord[]>> {
    const res = await apiClient.get('/donations', { params });
    return res.data;
  },

  async createDonation(data: {
    hospitalName: string;
    bloodGroup: string;
    units: number;
    donationType?: string;
    requestId?: string;
    notes?: string;
  }): Promise<ApiResponse<DonationRecord>> {
    const res = await apiClient.post('/donations', data);
    return res.data;
  },
};
