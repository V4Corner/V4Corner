import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAnnouncements } from '../api/announcements';
import { getCalendarEvents } from '../api/calendar';
import { getBlogs } from '../api/blogs';
import type { Announcement } from '../types/announcement';
import type { CalendarEvent } from '../types/calendar';
import type { Blog } from '../types/blog';

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
    ]).then((results) => {
      if (!isMounted) return;

      const [announcementsResult, eventsResult, blogsResult] = results;

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

      <div className="card home-section">
        <h2 className="section-title">班级通知</h2>
        <ul className="notice-list">
          {announcements.map((notice) => (
            <li key={notice.id} className="notice-item">
              <div>
                <div className="notice-title">{notice.title}</div>
                <div className="notice-content">{notice.content}</div>
              </div>
              <span className="notice-date">{formatDate(notice.published_at)}</span>
            </li>
          ))}
          {announcements.length === 0 && (
            <li className="notice-empty">暂无通知</li>
          )}
        </ul>
      </div>

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
              const title = cellEvents.map((event) => event.title).join(' / ');
              const isToday = dateKey === todayKey;
              return (
                <div
                  key={dateKey}
                  className={`calendar-cell${cell.inCurrentMonth ? '' : ' muted'}${hasEvent ? ' event' : ''}${isToday ? ' today' : ''}`}
                  title={title}
                >
                  <span className="calendar-date">{cell.date.getDate()}</span>
                  {hasEvent && (
                    <div className="event-list">
                      {cellEvents.slice(0, 2).map((event) => (
                        <span
                          key={event.id}
                          className={`event-title ${event.importance ?? 'low'}`}
                          title={getEventDetail(event)}
                        >
                          {event.title}
                        </span>
                      ))}
                      {cellEvents.length > 2 && (
                        <span className="event-more">+{cellEvents.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {events.length === 0 && <p className="small-muted">本月暂无活动安排</p>}
        </div>
      </div>

      <div className="card home-section">
        <div className="section-header">
          <h2 className="section-title">博客推送</h2>
          <Link to="/blogs" className="link-inline">查看更多</Link>
        </div>
        <ul className="feed-list">
          {blogs.map((blog) => (
            <li key={blog.id} className="feed-item">
              <span className="feed-time">{formatDate(blog.created_at)}</span>
              <Link to={`/blogs/${blog.id}`} className="feed-title">
                {blog.title}
              </Link>
              <span className="feed-meta">· {blog.author}</span>
            </li>
          ))}
          {blogs.length === 0 && <li className="feed-empty">暂无博客推送</li>}
        </ul>
      </div>
    </section>
  );
}

export default Home;
