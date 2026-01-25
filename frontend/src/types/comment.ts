// 评论相关类型定义

export interface CommentAuthor {
  id: number;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
}

export interface Comment {
  id: number;
  content: string;
  author: CommentAuthor;
  parent_id: number | null;
  parent_author: string | null;
  replies_count: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string | null;
  is_author: boolean;
  can_edit: boolean;
}

export interface CommentCreate {
  content: string;
  parent_id?: number;
}

export interface CommentUpdate {
  content: string;
}

export interface CommentListResponse {
  total: number;
  page: number;
  size: number;
  items: Comment[];
}

export type CommentSortType = 'asc' | 'desc' | 'hot';
