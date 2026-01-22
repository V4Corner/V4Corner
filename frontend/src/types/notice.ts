/**
 * 通知列表项
 */
export interface NoticeListItem {
  id: number;
  title: string;
  excerpt: string;
  is_important: boolean;
  author: string;
  views: number;
  published_at: string;
  date_display: string;
}

/**
 * 通知详情
 */
export interface NoticeDetail {
  id: number;
  title: string;
  content: string;
  is_important: boolean;
  author: string;
  author_id: number;
  views: number;
  published_at: string;
  updated_at: string | null;
  is_owner: boolean;
  can_edit: boolean;
}

/**
 * 简化通知（首页用）
 */
export interface NoticeMini {
  id: number;
  title: string;
  is_important: boolean;
  published_at: string;
  date_display: string;
}

/**
 * 通知列表响应
 */
export interface NoticeListResponse {
  total: number;
  page: number;
  size: number;
  items: NoticeListItem[];
}

/**
 * 最新通知响应
 */
export interface NoticeLatestResponse {
  items: NoticeMini[];
}

/**
 * 创建通知
 */
export interface NoticeCreate {
  title: string;
  content: string;
  is_important?: boolean;
}

/**
 * 更新通知
 */
export interface NoticeUpdate {
  title?: string;
  content?: string;
  is_important?: boolean;
}
