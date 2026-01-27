export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  description: string | null;
  is_all_day: boolean;
  importance?: 'low' | 'normal' | 'high';
}

export interface CalendarEventListResponse {
  month: string;
  items: CalendarEvent[];
}

export interface CalendarEventCreate {
  title: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  description?: string | null;
  is_all_day?: boolean;
  importance?: 'low' | 'normal' | 'high';
}

export interface CalendarEventUpdate {
  title?: string;
  date?: string;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  description?: string | null;
  is_all_day?: boolean;
  importance?: 'low' | 'normal' | 'high';
}
