import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnnouncements } from '../api/announcements';
import { getCalendarEvents } from '../api/calendar';
import { getBlogs } from '../api/blogs';
import { getLatestNotices } from '../api/notice';
import { getClassStats } from '../api/stats';
import CheckInCard from '../components/CheckInCard';
import ActivityFeed from '../components/ActivityFeed';
import type { Announcement } from '../types/announcement';
import type { CalendarEvent } from '../types/calendar';
import type { Blog } from '../types/blog';
import type { NoticeMini } from '../types/notice';
import type { ClassStats } from '../types/stats';

function formatDate(value: string): string {
  return value.split('T')[0];
}

function toDateKey(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getEventDetail(event: CalendarEvent): string {
  const parts = [event.title];
  if (event.start_time || event.end_time) {
    const start = event.start_time ? event.start_time.slice(0, 5) : '';
    const end = event.end_time ? event.end_time.slice(0, 5) : '';
    const timeLabel = start && end ? `${start}-${end}` : start || end;
    if (timeLabel) {
      parts.push(timeLabel);
    }
  }
  if (event.location) {
    parts.push(event.location);
  }
  return parts.join(' · ');
}

function Home() {
  const today = new Date();
  const todayKey = toDateKey(today);
  const monthStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = `${today.getFullYear()} 年 ${today.getMonth() + 1} 月`;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [notices, setNotices] = useState<NoticeMini[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      getAnnouncements({ page: 1, size: 5 }),
      getCalendarEvents(monthStr),
      getBlogs({ page: 1, size: 5 }),
      getLatestNotices(3),
      getClassStats(),
    ]).then((results) => {
      if (!isMounted) return;

      const [announcementsResult, eventsResult, blogsResult, noticesResult, statsResult] = results;

      if (announcementsResult.status === 'fulfilled') {
        setAnnouncements(announcementsResult.value.items);
      } else {
        setError(announcementsResult.reason?.message ?? '通知加载失败');
      }

      if (eventsResult.status === 'fulfilled') {
        setEvents(eventsResult.value.items);
      } else {
        setError(eventsResult.reason?.message ?? '日历加载失败');
      }

      if (blogsResult.status === 'fulfilled') {
        setBlogs(blogsResult.value.items);
      } else {
        setError(blogsResult.reason?.message ?? '博客加载失败');
      }

      if (noticesResult.status === 'fulfilled') {
        setNotices(noticesResult.value.items);
      } else {
        setError(noticesResult.reason?.message ?? '最新通知加载失败');
      }

      if (statsResult.status === 'fulfilled') {
        setStats(statsResult.value);
      } else {
        setError(statsResult.reason?.message ?? '统计数据加载失败');
      }

      setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [monthStr]);

  const eventMap = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((event) => {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    });
    return map;
  }, [events]);

  const calendarCells = useMemo(() => {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const startOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;

    return Array.from({ length: totalCells }, (_, idx) => {
      const dayIndex = idx - startOffset + 1;
      if (dayIndex <= 0) {
        const day = prevMonthDays + dayIndex;
        const dateValue = new Date(year, month - 1, day);
        return { date: dateValue, inCurrentMonth: false };
      }
      if (dayIndex > daysInMonth) {
        const day = dayIndex - daysInMonth;
        const dateValue = new Date(year, month + 1, day);
        return { date: dateValue, inCurrentMonth: false };
      }
      const dateValue = new Date(year, month, dayIndex);
      return { date: dateValue, inCurrentMonth: true };
    });
  }, [today]);

  if (loading) {
    return <p>加载中...</p>;
  }

  return (
    <section className="home">
      <div className="home-hero">
        <h1>欢迎来到 V4Corner</h1>
        <p>行健-车辆4班的班级在线空间，记录成长，分享知识。</p>
      </div>

      {error && <p className="small-muted">{error}</p>}

      <div className="home-layout">
        {/* Left Column */}
        <div className="home-left">
          <div className="card home-section">
            <div className="section-header">
              <h2 className="section-title">班级通知</h2>
              <Link to="/notices" className="link-inline">查看更多</Link>
            </div>
            <ul className="notice-list">
              {notices.map((notice) => (
                <li key={notice.id} className="notice-item">
                  <div>
                    <Link to={`/notices/${notice.id}`} className="notice-title">
                      {notice.is_important && (
                        <span style={{
                          backgroundColor: '#ef4444',
                          color: 'white',
                          padding: '0.15rem 0.4rem',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          marginRight: '0.5rem'
                        }}>
                          重要
                        </span>
                      )}
                      {notice.title}
                    </Link>
                    <div className="notice-content">{notice.title}</div>
                  </div>
                  <span className="notice-date">{notice.date_display}</span>
                </li>
              ))}
              {notices.length === 0 && (
                <li className="notice-empty">暂无通知</li>
              )}
            </ul>
          </div>

          {/* Class statistics card */}
          <div className="card stats-card-plain">
            <h3>班级数据</h3>
            {stats ? (
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{stats.member_count}</div>
                  <div className="stat-label">班级成员</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.blog_count}</div>
                  <div className="stat-label">发布博客</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{stats.longest_streak}</div>
                  <div className="stat-label">连续签到</div>
                </div>
              </div>
            ) : (
              <p className="small-muted">加载中...</p>
            )}
          </div>
        </div>

        {/* Center Column */}
        <div className="home-main">
          <div className="card home-section">
            <div className="section-header">
              <h2 className="section-title">精选博客</h2>
              <Link to="/blogs" className="link-inline">查看更多</Link>
            </div>
            <div className="blog-cards-grid">
              {blogs.map((blog) => (
                <Link key={blog.id} to={`/blogs/${blog.id}`} className="blog-card">
                  <h3 className="blog-card-title">{blog.title}</h3>
                  <p className="blog-card-excerpt">{blog.summary || '暂无摘要'}</p>
                  <div className="blog-card-meta">
                    <span>{blog.author}</span>
                    <span>{formatDate(blog.created_at)}</span>
                  </div>
                </Link>
              ))}
              {blogs.length === 0 && <p className="small-muted">暂无博客推送</p>}
            </div>
          </div>

          <ActivityFeed />
        </div>

        {/* Right Column */}
        <div className="home-sidebar">
          <CheckInCard />

          <div className="card home-section">
            <div className="section-header">
              <h2 className="section-title">班级日历</h2>
              <span className="section-subtitle">{monthLabel}</span>
            </div>
            <div className="calendar">
              <div className="calendar-weekdays">
                <span>一</span>
                <span>二</span>
                <span>三</span>
                <span>四</span>
                <span>五</span>
                <span>六</span>
                <span>日</span>
              </div>
              <div className="calendar-grid">
                {calendarCells.map((cell) => {
                  const dateKey = toDateKey(cell.date);
                  const cellEvents = eventMap.get(dateKey) ?? [];
                  const hasEvent = cellEvents.length > 0;
                  const isSelected = selectedDate === dateKey;
                  const isToday = dateKey === todayKey;

                  // 获取该日期最高优先级
                  const getHighestPriority = (events: typeof cellEvents) => {
                    if (events.length === 0) return 'low';
                    const hasHigh = events.some(e => e.importance === 'high');
                    const hasNormal = events.some(e => e.importance === 'normal');
                    return hasHigh ? 'high' : (hasNormal ? 'normal' : 'low');
                  };
                  const priority = hasEvent ? getHighestPriority(cellEvents) : 'low';

                  return (
                    <div
                      key={dateKey}
                      className="calendar-cell-wrapper"
                    >
                      <div
                        className={`calendar-cell${cell.inCurrentMonth ? '' : ' muted'}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                        onClick={() => {
                          setSelectedDate(isSelected ? null : dateKey);
                        }}
                      >
                        <span className="calendar-date">{cell.date.getDate()}</span>
                        {hasEvent && (
                          <div className={`event-indicator-dot ${priority}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Event details below calendar */}
              {selectedDate && (() => {
                const cellEvents = eventMap.get(selectedDate) ?? [];
                if (cellEvents.length === 0) return null;
                return (
                  <div className="calendar-event-details">
                    <div className="event-details-header">
                      <h4>{selectedDate}</h4>
                    </div>
                    <div className="event-details-list">
                      {cellEvents.map((event) => (
                        <div
                          key={event.id}
                          className={`event-details-item ${event.importance ?? 'low'}`}
                        >
                          <div className="event-details-title">{event.title}</div>
                          <div className="event-details-detail">
                            {getEventDetail(event)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {events.length === 0 && <p className="small-muted">本月暂无活动安排</p>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
