// 点赞相关 API

import { apiRequest } from './client';
import type { LikeResponse, LikeStatusResponse } from '../types/like';

export async function likeBlog(blogId: number): Promise<LikeResponse> {
  return apiRequest<LikeResponse>(`/api/blogs/${blogId}/like`, {
    method: 'POST',
  });
}

export async function unlikeBlog(blogId: number): Promise<LikeResponse> {
  return apiRequest<LikeResponse>(`/api/blogs/${blogId}/like`, {
    method: 'DELETE',
  });
}

export async function getLikeStatus(blogId: number): Promise<LikeStatusResponse> {
  return apiRequest<LikeStatusResponse>(`/api/blogs/${blogId}/like/status`);
}
