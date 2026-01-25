// 点赞相关类型

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

export interface LikeStatusResponse {
  is_liked: boolean;
  likes_count: number;
}
