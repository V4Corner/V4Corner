// 收藏相关 API

import { apiRequest } from './client';
import type {
  FavoriteFolder,
  FavoriteFolderListResponse,
  FavoriteCreate,
  FavoriteDelete,
  FavoriteResponse,
  FavoriteStatusResponse,
  FavoriteFolderCreate,
  FavoriteFolderUpdate,
} from '../types/favorite';
import type { BlogListResponse } from '../types/blog';

// ============================================
// 收藏文件夹管理
// ============================================

export async function createFavoriteFolder(data: FavoriteFolderCreate): Promise<FavoriteFolder> {
  return apiRequest<FavoriteFolder>('/api/users/favorites/folders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getFavoriteFolders(): Promise<FavoriteFolderListResponse> {
  return apiRequest<FavoriteFolderListResponse>('/api/users/favorites/folders');
}

export async function updateFavoriteFolder(
  folderId: number,
  data: FavoriteFolderUpdate
): Promise<FavoriteFolder> {
  return apiRequest<FavoriteFolder>(`/api/users/favorites/folders/${folderId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteFavoriteFolder(folderId: number): Promise<void> {
  return apiRequest<void>(`/api/users/favorites/folders/${folderId}`, {
    method: 'DELETE',
  });
}

// ============================================
// 收藏博客
// ============================================

export async function favoriteBlog(blogId: number, data: FavoriteCreate): Promise<FavoriteResponse> {
  return apiRequest<FavoriteResponse>(`/api/blogs/${blogId}/favorite`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function unfavoriteBlog(blogId: number, data?: FavoriteDelete): Promise<FavoriteResponse> {
  return apiRequest<FavoriteResponse>(`/api/blogs/${blogId}/favorite`, {
    method: 'DELETE',
    body: data ? JSON.stringify(data) : undefined,
  });
}

export async function getFavoriteStatus(blogId: number): Promise<FavoriteStatusResponse> {
  return apiRequest<FavoriteStatusResponse>(`/api/blogs/${blogId}/favorite/status`);
}

export async function getFolderFavorites(
  folderId: number,
  page: number = 1,
  size: number = 20
): Promise<BlogListResponse> {
  return apiRequest<BlogListResponse>(
    `/api/users/favorites/folders/${folderId}?page=${page}&size=${size}`
  );
}

export async function getAllFavorites(page: number = 1, size: number = 20): Promise<BlogListResponse> {
  return apiRequest<BlogListResponse>(`/api/users/favorites?page=${page}&size=${size}`);
}
