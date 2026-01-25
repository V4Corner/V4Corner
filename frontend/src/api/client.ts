// 通用 API 请求客户端

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// 导出 API_BASE 供其他模块使用
export { API_BASE };

// 从 localStorage 获取 Token
export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

// 保存 Token 到 localStorage
export function setAccessToken(token: string): void {
  localStorage.setItem('access_token', token);
}

// 清除 Token
export function clearAccessToken(): void {
  localStorage.removeItem('access_token');
}

// 通用请求函数
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    signal: options.signal,  // 支持 AbortSignal
  });

  // 401 时清除 Token 并跳转到登录页
  if (response.status === 401) {
    clearAccessToken();
    window.location.href = '/login';
    throw new Error('未认证');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '请求失败' }));

    // FastAPI returns different error formats
    if (typeof error.detail === 'string') {
      throw new Error(error.detail);
    } else if (Array.isArray(error.detail)) {
      // Validation errors (422) return an array
      const messages = error.detail.map((e: any) => e.msg).join(', ');
      throw new Error(messages);
    } else {
      throw new Error('请求失败');
    }
  }

  // 204 No Content 不返回数据
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// GET 请求
export function get<T>(url: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(url, { method: 'GET', signal });
}

// POST 请求
export function post<T>(url: string, data: unknown, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(url, {
    method: 'POST',
    body: JSON.stringify(data),
    signal,
  });
}

// PUT 请求
export function put<T>(url: string, data: unknown, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(url, {
    method: 'PUT',
    body: JSON.stringify(data),
    signal,
  });
}

// DELETE 请求
export function del<T>(url: string, signal?: AbortSignal): Promise<T> {
  return apiRequest<T>(url, { method: 'DELETE', signal });
}

// 上传文件
export async function uploadFile<T>(url: string, file: File): Promise<T> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: '上传失败' }));
    throw new Error(error.detail || '上传失败');
  }

  return response.json();
}
