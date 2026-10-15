import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface PublicStats {
  totalDonors: number;
  activeRequests: number;
  completedDonations: number;
  totalUsers: number;
  avgResponseMinutes: number;
  verifiedRate: number;
}

export const analyticsApi = {
  async getPublicStats(): Promise<ApiResponse<PublicStats>> {
    const res = await apiClient.get('/analytics/public-stats');
    return res.data;
  },

  async getOverview(): Promise<ApiResponse<any>> {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },
};
