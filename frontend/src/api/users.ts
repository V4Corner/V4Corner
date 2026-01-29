// 用户相关 API

import { get, put, patch, uploadFile } from './client';
import type {
  User,
  UserPublic,
  UpdateUserRequest,
  AvatarUploadResponse,
  UserRoleItem,
  UserRoleListResponse
} from '../types/user';
import type { BlogListResponse } from '../types/blog';

export async function getCurrentUser(): Promise<User> {
  return get<User>('/api/users/me');
}

export async function updateUser(data: UpdateUserRequest): Promise<User> {
  return put<User>('/api/users/me', data);
}

export async function uploadAvatar(file: File): Promise<AvatarUploadResponse> {
  return uploadFile<AvatarUploadResponse>('/api/users/me/avatar', file);
}

export async function getUserById(userId: number): Promise<UserPublic> {
  return get<UserPublic>(`/api/users/${userId}`);
}

export async function getUsersByRole(role: 'student' | 'committee' | 'admin', params?: {
  page?: number;
  size?: number;
}): Promise<UserRoleListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());
  const queryString = queryParams.toString();
  return get<UserRoleListResponse>(`/api/users/roles/${role}${queryString ? `?${queryString}` : ''}`);
}

export async function updateUserRole(userId: number, role: 'student' | 'committee' | 'admin'): Promise<UserRoleItem> {
  return patch<UserRoleItem>(`/api/users/${userId}/role`, { role });
}

export async function getUserBlogs(
  userId: number,
  params?: {
    page?: number;
    size?: number;
    q?: string;
    sort_by?: string;
    sort_order?: string;
    date_from?: string;
    date_to?: string;
  }
): Promise<BlogListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());
  if (params?.q) queryParams.append('q', params.q);
  if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
  if (params?.sort_order) queryParams.append('sort_order', params.sort_order);
  if (params?.date_from) queryParams.append('date_from', params.date_from);
  if (params?.date_to) queryParams.append('date_to', params.date_to);

  const queryString = queryParams.toString();
  return get<BlogListResponse>(`/api/users/${userId}/blogs${queryString ? `?${queryString}` : ''}`);
}
