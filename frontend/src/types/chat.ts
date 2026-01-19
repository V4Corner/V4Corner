// AI对话相关类型定义

export interface Conversation {
  id: number;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationListItem {
  id: number;
  title: string;
  last_message: string | null;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationCreate {
  title?: string;
}

export interface ConversationUpdate {
  title: string;
}

export interface ConversationListResponse {
  total: number;
  page: number;
  size: number;
  items: ConversationListItem[];
}

export interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export interface MessageListItem {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  tokens_used: number | null;
  created_at: string;
}

export interface MessageCreate {
  content: string;
}

export interface MessageListResponse {
  total: number;
  page: number;
  size: number;
  items: MessageListItem[];
}

export interface MessageFeedbackCreate {
  feedback: 'helpful' | 'not_helpful';
}

export interface MessageFeedbackResponse {
  message: string;
}

export interface ConversationExportRequest {
  format: 'markdown' | 'json' | 'txt';
}

export interface ConversationExportResponse {
  content: string;
  filename: string;
}

export interface StreamChunk {
  id: number;
  role: 'assistant';
  content: string;
  delta: string;
}
