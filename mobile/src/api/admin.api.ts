import { apiClient } from './client';
import { ApiResponse, User } from '../types';

export const adminApi = {
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<User[]>> {
    const res = await apiClient.get('/admin/users', { params });
    return res.data;
  },

  async updateUserStatus(id: string, status: 'ACTIVE' | 'DISABLED', reason?: string): Promise<ApiResponse> {
    const res = await apiClient.put(`/admin/users/${id}/status`, { status, reason });
    return res.data;
  },

  async getAnalyticsOverview(): Promise<ApiResponse<{
    totalUsers: number;
    totalDonors: number;
    totalSeekers: number;
    availableDonors: number;
    activeRequests: number;
    emergencyRequests: number;
    completedRequests: number;
    totalAdmins: number;
  }>> {
    const res = await apiClient.get('/analytics/overview');
    return res.data;
  },

  async getBloodGroupStats(): Promise<ApiResponse<{ bloodGroup: string; count: number }[]>> {
    const res = await apiClient.get('/analytics/blood-groups');
    return res.data;
  },
};
