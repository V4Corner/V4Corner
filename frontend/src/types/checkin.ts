export interface ActivityItem {
  title: string;
  desc: string;
}

export interface CheckInResponse {
  id: number;
  fortune: '大吉' | '中吉' | '小吉' | '中平' | '凶' | '大凶';
  good: ActivityItem[];
  bad: ActivityItem[];
  streak: number;
  checkin_date: string;
}

export interface CheckInStatus {
  checked_today: boolean;
  current_streak: number;
}

export interface CheckInStreak {
  longest_streak: number;
  current_streak: number;
}
