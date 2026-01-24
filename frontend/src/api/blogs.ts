// 博客相关 API

import { get, post, put, del } from './client';
import type { Blog, BlogListResponse, BlogCreate, BlogUpdate } from '../types/blog';

export async function getBlogs(params: {
  page?: number;
  size?: number;
  author?: string;
  status?: 'draft' | 'published';
} = {}): Promise<BlogListResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.size) queryParams.set('size', params.size.toString());
  if (params.author) queryParams.set('author', params.author);
  if (params.status) queryParams.set('status', params.status);

  const queryString = queryParams.toString();
  return get<BlogListResponse>(`/api/blogs${queryString ? `?${queryString}` : ''}`);
}

export async function getBlog(blogId: number, signal?: AbortSignal): Promise<Blog> {
  return get<Blog>(`/api/blogs/${blogId}`, signal);
}

export async function createBlog(data: BlogCreate): Promise<Blog> {
  return post<Blog>('/api/blogs', data);
}

export async function updateBlog(blogId: number, data: BlogUpdate): Promise<Blog> {
  return put<Blog>(`/api/blogs/${blogId}`, data);
}

export async function deleteBlog(blogId: number): Promise<void> {
  return del<void>(`/api/blogs/${blogId}`);
}

// 获取草稿列表
export async function getDrafts(params: {
  page?: number;
  size?: number;
} = {}): Promise<BlogListResponse> {
  return getBlogs({ ...params, status: 'draft' });
}
