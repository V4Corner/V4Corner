// 通知 API 客户端

import { get, post, put, del } from './client';
import type {
  NotificationListResponse,
  NotificationMarkReadResponse,
  NotificationDeleteResponse,
  NotificationUnreadCountResponse
} from '../types/notification';

const API_PREFIX = '/api/notifications';

// 获取通知列表
export async function getNotifications(params?: {
  unread_only?: boolean;
  type?: string;
  page?: number;
  size?: number;
}): Promise<NotificationListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.unread_only) queryParams.set('unread_only', 'true');
  if (params?.type) queryParams.set('type', params.type);
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.size) queryParams.set('size', params.size.toString());

  const query = queryParams.toString();
  return get<NotificationListResponse>(
    `${API_PREFIX}${query ? `?${query}` : ''}`
  );
}

// 标记所有通知为已读
export async function markAllRead(): Promise<NotificationMarkReadResponse> {
  return post<NotificationMarkReadResponse>(`${API_PREFIX}/read-all`, {});
}

// 标记单个通知为已读
export async function markNotificationRead(
  notificationId: number
): Promise<void> {
  return put<void>(`${API_PREFIX}/${notificationId}/read`, {});
}

// 清除通知
export async function deleteNotifications(all: boolean = false): Promise<NotificationDeleteResponse> {
  const query = all ? '?all=true' : '?all=false';
  return del<NotificationDeleteResponse>(`${API_PREFIX}${query}`);
}

// 删除单个通知
export async function deleteNotification(notificationId: number): Promise<void> {
  return del<void>(`${API_PREFIX}/${notificationId}`);
}

// 获取未读通知数量
export async function getUnreadCount(): Promise<NotificationUnreadCountResponse> {
  return get<NotificationUnreadCountResponse>(`${API_PREFIX}/unread-count`);
}
