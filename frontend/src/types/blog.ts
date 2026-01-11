export interface Blog {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  author_id: number;
  author_avatar_url: string | null;
  views: number;
  is_owner: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BlogCreate {
  title: string;
  content: string;
}

export interface BlogUpdate {
  title: string;
  content: string;
}

export interface BlogListResponse {
  total: number;
  page: number;
  size: number;
  items: Blog[];
}

export interface BlogListItem {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  author_id: number;
  author_avatar_url: string | null;
  views: number;
  created_at: string;
}
