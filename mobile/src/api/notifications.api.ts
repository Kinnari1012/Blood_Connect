import { apiClient } from './client';
import { ApiResponse, NotificationItem } from '../types';

export const notificationsApi = {
  async getNotifications(page = 1, limit = 20): Promise<ApiResponse<NotificationItem[]>> {
    const res = await apiClient.get('/notifications', { params: { page, limit } });
    return res.data;
  },

  async markAllRead(): Promise<ApiResponse> {
    const res = await apiClient.put('/notifications/read-all');
    return res.data;
  },

  async markRead(id: string): Promise<ApiResponse> {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },
};
