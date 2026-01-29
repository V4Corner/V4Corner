export interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  author_id: number;
  author_avatar_url: string | null;
  status: 'draft' | 'published';
  views: number;
  likes_count: number;
  favorites_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  is_owner: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BlogCreate {
  title: string;
  content: string;
  status?: 'draft' | 'published';
}

export interface BlogUpdate {
  title?: string;
  content?: string;
  status?: 'draft' | 'published';
}

export interface BlogListResponse {
  total: number;
  page: number;
  size: number;
  items: BlogListItem[];
}

export interface BlogListItem {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  author_id: number;
  author_avatar_url: string | null;
  status: 'draft' | 'published';
  views: number;
  likes_count: number;
  favorites_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  created_at: string;
  favorited_at?: string;
  folders?: { id: number; name: string }[];
}
