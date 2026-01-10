// 成员相关 API

import { get } from './client';
import type { UserPublic } from '../types/user';

export interface MemberListResponse {
  total: number;
  page: number;
  size: number;
  items: UserPublic[];
}

export async function getMembers(search: string = '', page: number = 1): Promise<MemberListResponse> {
  const queryParams = new URLSearchParams();
  if (search) queryParams.set('q', search);
  queryParams.set('page', page.toString());

  return get<MemberListResponse>(`/api/members?${queryParams.toString()}`);
}
