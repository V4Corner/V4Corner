// 用户相关 API

import { get, put, uploadFile } from './client';
import type { User, UserPublic, UpdateUserRequest, AvatarUploadResponse } from '../types/user';
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

export async function getUserBlogs(userId: number, page: number = 1, size: number = 10): Promise<BlogListResponse> {
  return get<BlogListResponse>(`/api/users/${userId}/blogs?page=${page}&size=${size}`);
}
