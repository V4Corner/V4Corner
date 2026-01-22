import { del, get, post } from './client';
import type { CheckInResponse, CheckInStatus, CheckInStreak } from '../types/checkin';

export async function createCheckIn(): Promise<CheckInResponse> {
  return post<CheckInResponse>('/api/checkins', {});
}

export async function getCheckInStatus(): Promise<CheckInStatus> {
  return get<CheckInStatus>('/api/checkins/status');
}

export async function getCheckInStreak(): Promise<CheckInStreak> {
  return get<CheckInStreak>('/api/checkins/streak');
}
