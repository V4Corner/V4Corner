import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLatestActivities } from '../api/activity';
import type { ActivityListItem } from '../types/activity';

/**
 * 获取动态类型对应的 SVG 图标
 */
function getActivityIcon(type: string): React.ReactNode {
  const icons: Record<string, React.ReactNode> = {
    'blog_created': (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
    ),
    'notice_published': (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2.5 2v6h6M21.5 22v-6h-6" />
        <path d="M22 11.5A10 10 0 0 0 3.2 7.2M2 12.5a10 10 0 0 0 18.8 4.3" />
        <path d="M12 8v8" />
        <path d="M8 12h8" />
      </svg>
    ),
    'checkin_streak': (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38.5-2 1-3a15.3 15.3 0 0 1 4-2.4c1 0 1.5.5 2.5 1.5 1.9 1.9 1.4 5.1-1 6.5a3.8 3.8 0 0 0-5 0" />
        <path d="M15.5 7.5A2.5 2.5 0 0 0 18 5c0-1.39-1.64-3-2.5-3-.5 0-1 .5-1.5 1.5-.13.85.23 2.4 1.5 3.5 1.38 1.38 3.25 1.58 4 0" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    'checkin_first': (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    'user_joined': (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <line x1="20" y1="8" x2="20" y2="14" />
        <line x1="23" y1="11" x2="17" y2="11" />
      </svg>
    ),
  };
  return icons[type] || (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/**
 * 获取动态类型对应的颜色
 */
function getActivityColor(type: string): string {
  const colorMap: Record<string, string> = {
    'blog_created': '#3b82f6',   // 蓝色
    'notice_published': '#ef4444', // 红色
    'checkin_streak': '#f59e0b',   // 橙色
    'checkin_first': '#8b5cf6',    // 紫色
    'user_joined': '#10b981',      // 绿色
  };
  return colorMap[type] || '#64748b';
}

function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      try {
        const data = await getLatestActivities(10);
        if (isMounted) {
          setActivities(data.items);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || '加载动态失败');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchActivities();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="card home-section">
        <h2 className="section-title">最新动态</h2>
        <p className="small-muted">加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card home-section">
        <h2 className="section-title">最新动态</h2>
        <p className="small-muted">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="card home-section">
        <h2 className="section-title">最新动态</h2>
        <p className="small-muted">暂无动态</p>
      </div>
    );
  }

  return (
    <div className="card home-section">
      <h2 className="section-title">最新动态</h2>
      <ul className="activity-list">
        {activities.map((activity) => (
          <li key={activity.id} className="activity-item">
            <div className="activity-icon">
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <span className="activity-user">{activity.user_name}</span>
                <span className="activity-action">{activity.content}</span>
                {/* 只在博客和通知时显示链接 */}
                {activity.target_title && activity.target_url &&
                 (activity.type === 'blog_created' || activity.type === 'notice_published') && (
                  <Link to={activity.target_url} className="activity-target">
                    {activity.target_title}
                  </Link>
                )}
              </div>
              <span className="activity-time">{activity.time_display}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ActivityFeed;
