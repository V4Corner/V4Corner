// 通知相关类型定义

export type NotificationType = 'comment_reply' | 'blog_comment' | 'comment_reply_blog' | 'system';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  related_type: 'blog' | 'comment' | null;
  related_id: number | null;
  related_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationWithTimeDisplay extends Notification {
  time_display: string;
}

export interface NotificationListResponse {
  total: number;
  unread_count: number;
  page: number;
  size: number;
  items: NotificationWithTimeDisplay[];
}

export interface NotificationMarkReadResponse {
  message: string;
  marked_count: number;
}

export interface NotificationDeleteResponse {
  message: string;
  deleted_count: number;
}

export interface NotificationUnreadCountResponse {
  unread_count: number;
}
