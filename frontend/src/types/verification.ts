// 验证码相关类型定义

export interface VerificationRequest {
  email: string;
  type?: 'register' | 'reset_password';
}

export interface VerificationVerify {
  email: string;
  code: string;
}

export interface VerificationResponse {
  success: boolean;
  message: string;
  expires_in: number;
}
