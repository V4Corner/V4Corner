export interface Announcement {
  id: number;
  title: string;
  content: string;
  published_at: string;
  is_pinned: boolean;
}

export interface AnnouncementListResponse {
  total: number;
  page: number;
  size: number;
  items: Announcement[];
}
