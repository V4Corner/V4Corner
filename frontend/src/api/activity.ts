// 最新动态 API

import { get } from './client';
import type { ActivityListResponse, ActivityLatestResponse } from '../types/activity';

/**
 * 获取动态列表
 */
export async function getActivities(params?: {
  page?: number;
  size?: number;
  type?: string;
}): Promise<ActivityListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());
  if (params?.type) queryParams.append('type', params.type);

  const url = `/api/activities${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return get<ActivityListResponse>(url);
}

/**
 * 获取最新动态（首页用）
 */
export async function getLatestActivities(limit: number = 10): Promise<ActivityLatestResponse> {
  return get<ActivityLatestResponse>(`/api/activities/latest?limit=${limit}`);
}
