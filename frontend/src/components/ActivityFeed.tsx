import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLatestActivities } from '../api/activity';
import type { ActivityListItem } from '../types/activity';

/**
 * 获取动态类型对应的图标
 */
function getActivityIcon(type: string): string {
  const iconMap: Record<string, string> = {
    'blog_created': '📝',
    'notice_published': '📢',
    'checkin_streak': '🔥',
    'checkin_first': '✨',
    'user_joined': '👋',
  };
  return iconMap[type] || '📌';
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
            <div
              className="activity-icon"
              style={{ backgroundColor: getActivityColor(activity.type) }}
            >
              {getActivityIcon(activity.type)}
            </div>
            <div className="activity-content">
              <div className="activity-header">
                <span className="activity-user">{activity.user_name}</span>
                <span className="activity-action">{activity.content}</span>
                {activity.target_title && activity.target_url && (
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
