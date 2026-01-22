// 班级通知相关 API

import { get, post, put, del } from './client';
import type {
  NoticeListResponse,
  NoticeDetail,
  NoticeLatestResponse,
  NoticeCreate,
  NoticeUpdate
} from '../types/notice';

/**
 * 获取通知列表
 */
export async function getNotices(params: {
  page?: number;
  size?: number;
  is_important?: boolean;
} = {}): Promise<NoticeListResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.size) queryParams.set('size', params.size.toString());
  if (params.is_important !== undefined) {
    queryParams.set('is_important', params.is_important.toString());
  }

  const queryString = queryParams.toString();
  return get<NoticeListResponse>(`/api/notices${queryString ? `?${queryString}` : ''}`);
}

/**
 * 获取最新通知（首页用）
 */
export async function getLatestNotices(limit: number = 3): Promise<NoticeLatestResponse> {
  return get<NoticeLatestResponse>(`/api/notices/latest?limit=${limit}`);
}

/**
 * 获取通知详情
 */
export async function getNotice(noticeId: number, signal?: AbortSignal): Promise<NoticeDetail> {
  return get<NoticeDetail>(`/api/notices/${noticeId}`, signal);
}

/**
 * 创建通知
 */
export async function createNotice(data: NoticeCreate): Promise<NoticeDetail> {
  return post<NoticeDetail>('/api/notices', data);
}

/**
 * 更新通知
 */
export async function updateNotice(noticeId: number, data: NoticeUpdate): Promise<NoticeDetail> {
  return put<NoticeDetail>(`/api/notices/${noticeId}`, data);
}

/**
 * 删除通知
 */
export async function deleteNotice(noticeId: number): Promise<void> {
  return del<void>(`/api/notices/${noticeId}`);
}
