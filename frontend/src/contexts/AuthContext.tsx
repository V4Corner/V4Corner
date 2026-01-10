// 认证上下文 - 管理全局认证状态

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import { getCurrentUser } from '../api/users';
import { getAccessToken, setAccessToken, clearAccessToken } from '../api/client';
import type { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (username: string, email: string, password: string, passwordConfirm: string, nickname?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：检查是否有 Token，如果有则获取用户信息
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('获取用户信息失败:', error);
          clearAccessToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string, rememberMe: boolean = false) => {
    const response = await apiLogin({
      username_or_email: usernameOrEmail,
      password,
      remember_me: rememberMe,
    });

    // 保存 Token
    setAccessToken(response.access_token);

    // 获取完整用户信息
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const register = async (
    username: string,
    email: string,
    password: string,
    passwordConfirm: string,
    nickname?: string
  ) => {
    const response = await apiRegister({
      username,
      email,
      password,
      password_confirm: passwordConfirm,
      nickname,
    });

    // 注册成功后自动登录
    setAccessToken(response.access_token);

    // 获取完整用户信息
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      // 无论 API 调用成功与否，都清除本地状态
      clearAccessToken();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!getAccessToken()) {
      return;
    }

    try {
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
