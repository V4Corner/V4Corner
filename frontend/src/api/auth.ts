// 认证相关 API

import { post, get } from './client';
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenResponse } from '../types/auth';
import type { CheckResponse } from '../types/validation';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  return post<AuthResponse>('/api/auth/login', data);
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  return post<AuthResponse>('/api/auth/register', data);
}

export async function logout(): Promise<{ message: string }> {
  return post<{ message: string }>('/api/auth/logout', {});
}

export async function refreshToken(): Promise<RefreshTokenResponse> {
  return post<RefreshTokenResponse>('/api/auth/refresh', {});
}

export async function checkUsername(username: string): Promise<CheckResponse> {
  return get<CheckResponse>(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
}

export async function checkEmail(email: string): Promise<CheckResponse> {
  return get<CheckResponse>(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
}
