import { apiClient } from './client';
import { ApiResponse } from '../types';

export interface TestimonialItem {
  id: string;
  _id?: string;
  authorName: string;
  role?: string;
  city: string;
  bloodGroup: string;
  content: string;
  rating?: number;
  initials?: string;
  isApproved?: boolean;
  createdAt: string;
}

export const testimonialsApi = {
  async getAll(): Promise<ApiResponse<TestimonialItem[]>> {
    const res = await apiClient.get('/testimonials');
    return res.data;
  },

  async create(data: {
    authorName: string;
    role?: string;
    city: string;
    bloodGroup: string;
    content: string;
    rating?: number;
  }): Promise<ApiResponse<TestimonialItem>> {
    const res = await apiClient.post('/testimonials', data);
    return res.data;
  },
};
