// 收藏相关类型

export interface FavoriteFolder {
  id: number;
  user_id: number;
  name: string;
  is_public: boolean;
  favorites_count: number;
  created_at: string;
}

export interface FavoriteFolderCreate {
  name: string;
  is_public?: boolean;
}

export interface FavoriteFolderUpdate {
  name?: string;
  is_public?: boolean;
}

export interface FavoriteFolderListResponse {
  folders: FavoriteFolder[];
}

export interface FavoriteCreate {
  folder_id: number;
}

export interface FavoriteDelete {
  folder_id?: number;
}

export interface FavoriteResponse {
  favorited: boolean;
  favorites_count: number;
}

export interface FavoriteFolderInfo {
  id: number;
  name: string;
}

export interface FavoriteStatusResponse {
  is_favorited: boolean;
  folders: FavoriteFolderInfo[];
  favorites_count: number;
}
