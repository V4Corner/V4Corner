import { get } from './client';
import type { ClassStats } from '../types/stats';

export async function getClassStats(): Promise<ClassStats> {
  return get<ClassStats>('/api/stats');
}
