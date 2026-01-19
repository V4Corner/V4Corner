// AI对话相关 API 接口

import { apiRequest, getAccessToken } from './client';
import type {
  Conversation,
  ConversationCreate,
  ConversationListResponse,
  ConversationUpdate,
  ConversationExportRequest,
  ConversationExportResponse,
  Message,
  MessageCreate,
  MessageFeedbackCreate,
  MessageFeedbackResponse,
  MessageListResponse,
  StreamChunk
} from '../types/chat';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// ============= Conversation API =============

/**
 * 获取对话列表
 */
export async function getConversations(params: {
  q?: string;
  page?: number;
  size?: number;
} = {}): Promise<ConversationListResponse> {
  const queryParams = new URLSearchParams();
  if (params.q) queryParams.set('q', params.q);
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.size) queryParams.set('size', params.size.toString());

  return apiRequest<ConversationListResponse>(
    `/api/chat/conversations?${queryParams.toString()}`
  );
}

/**
 * 创建新对话
 */
export async function createConversation(data: ConversationCreate): Promise<Conversation> {
  return apiRequest<Conversation>('/api/chat/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 获取对话详情
 */
export async function getConversation(conversationId: number): Promise<Conversation> {
  return apiRequest<Conversation>(`/api/chat/conversations/${conversationId}`);
}

/**
 * 重命名对话
 */
export async function updateConversation(
  conversationId: number,
  data: ConversationUpdate
): Promise<Conversation> {
  return apiRequest<Conversation>(`/api/chat/conversations/${conversationId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * 删除对话
 */
export async function deleteConversation(conversationId: number): Promise<void> {
  return apiRequest<void>(`/api/chat/conversations/${conversationId}`, {
    method: 'DELETE',
  });
}

// ============= Message API =============

/**
 * 获取对话的消息列表
 */
export async function getMessages(conversationId: number, params: {
  page?: number;
  size?: number;
} = {}): Promise<MessageListResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.set('page', params.page.toString());
  if (params.size) queryParams.set('size', params.size.toString());

  return apiRequest<MessageListResponse>(
    `/api/chat/conversations/${conversationId}/messages?${queryParams.toString()}`
  );
}

/**
 * 发送消息（非流式）
 */
export async function sendMessage(
  conversationId: number,
  data: MessageCreate
): Promise<Message> {
  return apiRequest<Message>(
    `/api/chat/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

/**
 * 发送消息（流式）
 */
export async function sendMessageStream(
  conversationId: number,
  data: MessageCreate,
  onChunk: (chunk: StreamChunk) => void,
  onComplete?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('未认证');
  }

  try {
    const response = await fetch(
      `${API_BASE}/api/chat/conversations/${conversationId}/messages?stream=true`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('发送消息失败');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        onComplete?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            onComplete?.();
            return;
          }

          try {
            const chunk = JSON.parse(data) as StreamChunk;
            onChunk(chunk);
          } catch (e) {
            console.error('解析SSE数据失败:', e);
          }
        }
      }
    }
  } catch (error) {
    onError?.(error as Error);
    throw error;
  }
}

/**
 * 重新生成最后一条 AI 消息
 */
export async function regenerateMessage(conversationId: number): Promise<Message> {
  return apiRequest<Message>(
    `/api/chat/conversations/${conversationId}/messages/regenerate`,
    {
      method: 'POST',
      body: JSON.stringify({}),
    }
  );
}

/**
 * 对 AI 消息进行反馈
 */
export async function submitFeedback(
  conversationId: number,
  messageId: number,
  data: MessageFeedbackCreate
): Promise<MessageFeedbackResponse> {
  return apiRequest<MessageFeedbackResponse>(
    `/api/chat/conversations/${conversationId}/messages/${messageId}/feedback`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

/**
 * 导出对话
 */
export async function exportConversation(
  conversationId: number,
  data: ConversationExportRequest
): Promise<ConversationExportResponse> {
  return apiRequest<ConversationExportResponse>(
    `/api/chat/conversations/${conversationId}/export`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

/**
 * 下载导出的对话文件
 */
export function downloadExportedConversation(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
