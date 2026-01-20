import { get } from './client';
import type { AnnouncementListResponse } from '../types/announcement';

export async function getAnnouncements(params: { page?: number; size?: number } = {}): Promise<AnnouncementListResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.size) queryParams.set('size', params.size.toString());

  const queryString = queryParams.toString();
  return get<AnnouncementListResponse>(`/api/announcements${queryString ? `?${queryString}` : ''}`);
}
