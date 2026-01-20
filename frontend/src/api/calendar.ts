import { get } from './client';
import type { CalendarEventListResponse } from '../types/calendar';

export async function getCalendarEvents(month?: string): Promise<CalendarEventListResponse> {
  const queryParams = new URLSearchParams();
  if (month) queryParams.set('month', month);

  const queryString = queryParams.toString();
  return get<CalendarEventListResponse>(`/api/calendar/events${queryString ? `?${queryString}` : ''}`);
}
