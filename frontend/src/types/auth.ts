// 认证相关类型定义

export interface LoginRequest {
  username_or_email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  verification_code: string;
  nickname?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: number;
    username: string;
    nickname: string | null;
    avatar_url: string | null;
  };
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}
