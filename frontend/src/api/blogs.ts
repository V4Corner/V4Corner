// 博客相关 API

import { get, post, put, del } from './client';
import type { Blog, BlogListResponse, BlogCreate, BlogUpdate } from '../types/blog';

export async function getBlogs(params: {
  page?: number;
  size?: number;
  author?: string;
  status?: 'draft' | 'published';
  // 搜索参数
  q?: string;
  search_in?: string;
  // 日期筛选
  date_from?: string;
  date_to?: string;
  // 排序参数
  sort_by?: 'created_at' | 'views' | 'likes' | 'favorites';
  sort_order?: 'asc' | 'desc';
} = {}): Promise<BlogListResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.size) queryParams.set('size', params.size.toString());
  if (params.author) queryParams.set('author', params.author);
  if (params.status) queryParams.set('status', params.status);
  if (params.q) queryParams.set('q', params.q);
  if (params.search_in) queryParams.set('search_in', params.search_in);
  if (params.date_from) queryParams.set('date_from', params.date_from);
  if (params.date_to) queryParams.set('date_to', params.date_to);
  if (params.sort_by) queryParams.set('sort_by', params.sort_by);
  if (params.sort_order) queryParams.set('sort_order', params.sort_order);

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
