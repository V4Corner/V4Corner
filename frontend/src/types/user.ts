// 用户相关类型定义

export interface User {
  id: number;
  username: string;
  email: string;
  nickname: string | null;
  avatar_url: string | null;
  role: 'student' | 'committee' | 'admin';
  class: string | null;
  bio: string | null;
  stats: UserStats;
  created_at: string;
  updated_at?: string;
}

export interface UserPublic {
  id: number;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  role: 'student' | 'committee' | 'admin';
  class: string | null;
  bio: string | null;
  stats: UserStats;
  created_at: string;
}

export interface UserStats {
  blog_count: number;
  total_views: number;
}

export interface UpdateUserRequest {
  nickname?: string;
  class?: string;
  bio?: string;
}

export interface AvatarUploadResponse {
  avatar_url: string;
}

export interface UserRoleItem {
  id: number;
  username: string;
  nickname: string | null;
  role: 'student' | 'committee' | 'admin';
}

export interface UserRoleListResponse {
  total: number;
  page: number;
  size: number;
  items: UserRoleItem[];
}
