// 认证相关 API

import { post } from './client';
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenResponse } from '../types/auth';

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
