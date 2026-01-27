import { get, post, put, del } from './client';
import type { CalendarEventListResponse, CalendarEvent, CalendarEventCreate, CalendarEventUpdate } from '../types/calendar';

export async function getCalendarEvents(month?: string): Promise<CalendarEventListResponse> {
  const queryParams = new URLSearchParams();
  if (month) queryParams.set('month', month);

  const queryString = queryParams.toString();
  return get<CalendarEventListResponse>(`/api/calendar/events${queryString ? `?${queryString}` : ''}`);
}

export async function createCalendarEvent(data: CalendarEventCreate): Promise<CalendarEvent> {
  return post<CalendarEvent>('/api/calendar/events', data);
}

export async function updateCalendarEvent(eventId: number, data: CalendarEventUpdate): Promise<CalendarEvent> {
  return put<CalendarEvent>(`/api/calendar/events/${eventId}`, data);
}

export async function deleteCalendarEvent(eventId: number): Promise<void> {
  return del<void>(`/api/calendar/events/${eventId}`);
}
