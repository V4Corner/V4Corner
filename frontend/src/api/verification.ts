// 验证码 API

import { post } from './client';
import type { VerificationRequest, VerificationVerify, VerificationResponse } from '../types/verification';

// 发送验证码
export async function sendVerificationCode(data: VerificationRequest): Promise<VerificationResponse> {
  return post<VerificationResponse>('/api/verification/send', data);
}

// 验证验证码
export async function verifyCode(data: VerificationVerify): Promise<VerificationResponse> {
  return post<VerificationResponse>('/api/verification/verify', data);
}
