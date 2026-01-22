/**
 * 动态用户信息
 */
export interface ActivityUserInfo {
  id: number;
  username: string;
  nickname: string | null;
  avatar: string | null;
}

/**
 * 动态关联对象
 */
export interface ActivityTarget {
  type: string | null;
  id: number | null;
  title: string | null;
  url: string | null;
}

/**
 * 动态列表项（简化版）
 */
export interface ActivityListItem {
  id: number;
  type: string;
  user_name: string;
  content: string;
  target_title: string | null;
  target_url: string | null;
  created_at: string;
  time_display: string;
}

/**
 * 动态列表响应
 */
export interface ActivityListResponse {
  total: number;
  page: number;
  size: number;
  items: ActivityListItem[];
}

/**
 * 最新动态响应（首页简化版）
 */
export interface ActivityLatestResponse {
  items: ActivityListItem[];
}

/**
 * 创建动态请求（内部接口）
 */
export interface ActivityCreate {
  type: string;
  content: string;
  target_type?: string;
  target_id?: number;
  target_title?: string;
}
