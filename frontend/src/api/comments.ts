// 评论 API 客户端

import { get, post, put, del } from './client';
import type {
  Comment,
  CommentCreate,
  CommentUpdate,
  CommentListResponse,
  CommentSortType
} from '../types/comment';

const API_PREFIX = '/api/blogs';

// 获取博客的评论列表
export async function getBlogComments(
  blogId: number,
  params?: {
    sort?: CommentSortType;
    page?: number;
    size?: number;
  }
): Promise<CommentListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.sort) queryParams.set('sort', params.sort);
  if (params?.page) queryParams.set('page', params.page.toString());
  if (params?.size) queryParams.set('size', params.size.toString());

  const query = queryParams.toString();
  return get<CommentListResponse>(
    `${API_PREFIX}/${blogId}/comments${query ? `?${query}` : ''}`
  );
}

// 发表评论
export async function createComment(
  blogId: number,
  data: CommentCreate
): Promise<Comment> {
  return post<Comment>(`${API_PREFIX}/${blogId}/comments`, data);
}

// 编辑评论
export async function updateComment(
  commentId: number,
  data: CommentUpdate
): Promise<Comment> {
  return put<Comment>(`/api/comments/${commentId}`, data);
}

// 删除评论
export async function deleteComment(commentId: number): Promise<void> {
  return del<void>(`/api/comments/${commentId}`);
}
