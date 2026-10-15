import { apiClient } from './client';
import { ApiResponse, BloodRequest } from '../types';

export const requestsApi = {
  async getPublicLiveRadar(params?: { city?: string; cluster?: string }): Promise<ApiResponse<any>> {
    const res = await apiClient.get('/requests/public/live-radar', { params });
    return res.data;
  },

  async createRequest(data: {
    patientName: string;
    bloodGroup: string;
    unitsRequired: number;
    hospital: string;
    location?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    requiredDate: string;
    requiredTime: string;
    urgency: 'Normal' | 'Urgent' | 'Critical';
    contactName: string;
    contactPhone: string;
  }): Promise<ApiResponse<BloodRequest>> {
    const res = await apiClient.post('/requests', data);
    return res.data;
  },

  async getMyRequests(): Promise<ApiResponse<BloodRequest[]>> {
    const res = await apiClient.get('/requests/my');
    return res.data;
  },

  async getMatchingRequests(params?: { page?: number; limit?: number }): Promise<ApiResponse<BloodRequest[]>> {
    const res = await apiClient.get('/requests/matching', { params });
    return res.data;
  },

  async getRequestById(id: string): Promise<ApiResponse<BloodRequest>> {
    const res = await apiClient.get(`/requests/${id}`);
    return res.data;
  },

  async cancelRequest(id: string): Promise<ApiResponse> {
    const res = await apiClient.delete(`/requests/${id}`);
    return res.data;
  },

  async acceptRequest(requestId: string): Promise<ApiResponse> {
    const res = await apiClient.post(`/requests/${requestId}/accept`);
    return res.data;
  },

  async declineRequest(requestId: string): Promise<ApiResponse> {
    const res = await apiClient.post(`/requests/${requestId}/decline`);
    return res.data;
  },

  async completeRequest(requestId: string): Promise<ApiResponse> {
    const res = await apiClient.post(`/requests/${requestId}/complete`);
    return res.data;
  },

  // Admin routes
  async approveRequest(id: string): Promise<ApiResponse> {
    const res = await apiClient.post(`/requests/${id}/approve`);
    return res.data;
  },

  async rejectRequest(id: string, reason: string): Promise<ApiResponse> {
    const res = await apiClient.post(`/requests/${id}/reject`, { reason });
    return res.data;
  },
};
