import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createCalendarEvent, deleteCalendarEvent, getCalendarEvents, updateCalendarEvent } from '../api/calendar';
import { getBlogs } from '../api/blogs';
import { createNotice, deleteNotice, getNotice, getNotices, updateNotice } from '../api/notice';
import { getClassStats } from '../api/stats';
import CheckInCard from '../components/CheckInCard';
import ActivityFeed from '../components/ActivityFeed';
import LikeButton from '../components/LikeButton';
import FavoriteButton from '../components/FavoriteButton';
import { formatNumber } from '../utils/formatNumber';
import type { CalendarEvent } from '../types/calendar';
import type { BlogListItem } from '../types/blog';
import type { NoticeListItem } from '../types/notice';
import type { ClassStats } from '../types/stats';
import { useAuth } from '../contexts/AuthContext';

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
  const { user } = useAuth();
  const canManage = user?.role === 'committee' || user?.role === 'admin';
  const today = new Date();
  const todayKey = toDateKey(today);

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [notices, setNotices] = useState<NoticeListItem[]>([]);
  const [stats, setStats] = useState<ClassStats | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(todayKey);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noticesError, setNoticesError] = useState<string | null>(null);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null);
  const [noticeForm, setNoticeForm] = useState({
    title: '',
    content: '',
    is_important: false,
  });
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    date: todayKey,
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    is_all_day: false,
    importance: 'normal' as 'low' | 'normal' | 'high',
  });

  const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = `${currentMonth.getFullYear()} 年 ${currentMonth.getMonth() + 1} 月`;

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
    setSelectedDate(toDateKey(newMonth));
    setEventForm((prev) => ({ ...prev, date: toDateKey(newMonth) }));
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
    setSelectedDate(toDateKey(newMonth));
    setEventForm((prev) => ({ ...prev, date: toDateKey(newMonth) }));
  };

  // 加载其他数据（通知、博客、统计）- 只在组件挂载时加载一次
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    Promise.allSettled([
      getBlogs({ page: 1, size: 6 }),
      getNotices({ page: 1, size: 6 }),
      getClassStats(),
    ]).then((results) => {
      if (!isMounted) return;

      const [blogsResult, noticesResult, statsResult] = results;

      if (blogsResult.status === 'fulfilled') {
        setBlogs(blogsResult.value.items);
      } else {
        setError(blogsResult.reason?.message ?? '博客加载失败');
      }

      if (noticesResult.status === 'fulfilled') {
        setNotices(noticesResult.value.items);
      } else {
        setNoticesError(noticesResult.reason?.message ?? '通知加载失败');
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
  }, []);

  // 加载日历事件 - 只在月份变化时重新加载
  useEffect(() => {
    let isMounted = true;

    getCalendarEvents(monthStr)
      .then((data) => {
        if (isMounted) {
          setEvents(data.items);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch calendar events:', err);
        if (isMounted) {
          setCalendarError(err.message ?? '日历加载失败');
        }
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
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
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
  }, [currentMonth]);

  const refreshNotices = async () => {
    try {
      const data = await getNotices({ page: 1, size: 6 });
      setNotices(data.items);
    } catch (err) {
      setNoticesError(err instanceof Error ? err.message : '通知加载失败');
    }
  };

  const resetNoticeForm = () => {
    setEditingNoticeId(null);
    setNoticeForm({ title: '', content: '', is_important: false });
  };

  const handleNoticeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canManage) return;

    try {
      if (editingNoticeId) {
        await updateNotice(editingNoticeId, {
          title: noticeForm.title,
          content: noticeForm.content,
          is_important: noticeForm.is_important,
        });
      } else {
        await createNotice({
          title: noticeForm.title,
          content: noticeForm.content,
          is_important: noticeForm.is_important,
        });
      }
      await refreshNotices();
      resetNoticeForm();
    } catch (err) {
      setNoticesError(err instanceof Error ? err.message : '通知提交失败');
    }
  };

  const handleNoticeEdit = async (notice: NoticeListItem) => {
    try {
      const detail = await getNotice(notice.id);
      setEditingNoticeId(notice.id);
      setNoticeForm({
        title: detail.title,
        content: detail.content,
        is_important: detail.is_important,
      });
    } catch (err) {
      setNoticesError(err instanceof Error ? err.message : '加载通知失败');
    }
  };

  const handleNoticeDelete = async (noticeId: number) => {
    if (!confirm('确定要删除这条通知吗？')) return;
    try {
      await deleteNotice(noticeId);
      await refreshNotices();
    } catch (err) {
      setNoticesError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handleEventSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canManage) return;

    const payload = {
      title: eventForm.title,
      date: eventForm.date,
      start_time: eventForm.start_time || null,
      end_time: eventForm.end_time || null,
      location: eventForm.location || null,
      description: eventForm.description || null,
      is_all_day: eventForm.is_all_day,
      importance: eventForm.importance,
    };

    try {
      if (editingEventId) {
        await updateCalendarEvent(editingEventId, payload);
      } else {
        await createCalendarEvent(payload);
      }
      const targetDate = new Date(`${eventForm.date}T00:00:00`);
      const targetMonthStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`;
      setSelectedDate(eventForm.date);
      setCurrentMonth(targetDate);
      const data = await getCalendarEvents(targetMonthStr);
      setEvents(data.items);
      setEditingEventId(null);
      setEventForm((prev) => ({
        ...prev,
        title: '',
        start_time: '',
        end_time: '',
        location: '',
        description: '',
        is_all_day: false,
        importance: 'normal',
      }));
    } catch (err) {
      setCalendarError(err instanceof Error ? err.message : '日历提交失败');
    }
  };

  const handleEventEdit = (event: CalendarEvent) => {
    setEditingEventId(event.id);
    setEventForm({
      title: event.title,
      date: event.date,
      start_time: event.start_time ?? '',
      end_time: event.end_time ?? '',
      location: event.location ?? '',
      description: event.description ?? '',
      is_all_day: event.is_all_day,
      importance: event.importance ?? 'normal',
    });
  };

  const handleEventDelete = async (eventId: number) => {
    if (!confirm('确定要删除该事件吗？')) return;
    try {
      await deleteCalendarEvent(eventId);
      const data = await getCalendarEvents(monthStr);
      setEvents(data.items);
    } catch (err) {
      setCalendarError(err instanceof Error ? err.message : '删除失败');
    }
  };

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
              {canManage && (
                <button className="btn btn-outline" onClick={resetNoticeForm}>
                  新建通知
                </button>
              )}
            </div>
            {noticesError && <p className="small-muted" style={{ color: 'var(--error)' }}>{noticesError}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notices.map((notice) => (
                <div key={notice.id} className="card" style={{ marginBottom: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'start' }}>
                    <div style={{ fontWeight: 600 }}>
                      {notice.is_important && (
                        <span style={{ color: '#ef4444', marginRight: '0.25rem' }}>●</span>
                      )}
                      {notice.title}
                    </div>
                    <span className="small-muted">{notice.date_display}</span>
                  </div>
                  <p className="small-muted" style={{ margin: '0.4rem 0 0' }}>{notice.excerpt}</p>
                  {canManage && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button className="btn btn-outline" onClick={() => handleNoticeEdit(notice)}>编辑</button>
                      <button className="btn btn-outline" onClick={() => handleNoticeDelete(notice.id)}>删除</button>
                    </div>
                  )}
                </div>
              ))}
              {notices.length === 0 && <p className="small-muted">暂无通知</p>}
            </div>

            {canManage && (
              <form onSubmit={handleNoticeSubmit} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">标题</label>
                  <input
                    className="form-input"
                    value={noticeForm.title}
                    onChange={(event) => setNoticeForm((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="例如：本周五晚自习取消"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">重要程度</label>
                  <select
                    className="form-input"
                    value={noticeForm.is_important ? 'important' : 'normal'}
                    onChange={(event) => setNoticeForm((prev) => ({ ...prev, is_important: event.target.value === 'important' }))}
                  >
                    <option value="normal">普通</option>
                    <option value="important">重要</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">内容（支持 Markdown）</label>
                  <textarea
                    className="form-textarea"
                    value={noticeForm.content}
                    onChange={(event) => setNoticeForm((prev) => ({ ...prev, content: event.target.value }))}
                    placeholder="请输入通知内容"
                    required
                  />
                </div>
                <div className="form-actions">
                  {editingNoticeId && (
                    <button type="button" className="btn btn-outline" onClick={resetNoticeForm}>取消编辑</button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingNoticeId ? '更新通知' : '发布通知'}
                  </button>
                </div>
              </form>
            )}
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

            {/* 精选博客列表视图 */}
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden',
              }}
            >
              {blogs.map((blog, index) => (
                <div
                  key={blog.id}
                  style={{
                    padding: '1rem 1.2rem',
                    borderBottom: index < blogs.length - 1 ? '1px solid #e2e8f0' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  {/* 左侧信息 */}
                  <div style={{ minWidth: 0 }}>
                    <Link
                      to={`/blogs/${blog.id}`}
                      style={{
                        margin: '0 0 0.4rem 0',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        textDecoration: 'none',
                      }}
                    >
                      {blog.title}
                    </Link>
                    <p
                      className="small-muted"
                      style={{
                        margin: '0 0 0.6rem 0',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {blog.excerpt}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.25rem',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        color: '#64748b',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#0f172a',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          flexShrink: 0
                        }}
                      >
                        {blog.author_avatar_url ? (
                          <img
                            src={`http://localhost:8000${blog.author_avatar_url}`}
                            alt={`${blog.author}'s avatar`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span>{blog.author[0].toUpperCase()}</span>
                        )}
                      </div>
                      <Link
                        to={`/users/${blog.author_id}`}
                        style={{
                          color: '#64748b',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          maxWidth: '7em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {blog.author}
                      </Link>
                      <span>·</span>
                      <span>{new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
                      <span>·</span>
                      <span>{formatNumber(blog.views)} 次阅读</span>
                    </div>
                  </div>

                  {/* 右侧操作按钮 */}
                  <div
                    style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                  >
                    <LikeButton blogId={blog.id} isLiked={blog.is_liked} likesCount={blog.likes_count} size="sm" />
                    <FavoriteButton blogId={blog.id} isFavorited={blog.is_favorited} favoritesCount={blog.favorites_count} size="sm" />
                  </div>
                </div>
              ))}
            </div>

            {blogs.length === 0 && <p className="small-muted">暂无博客推送</p>}
          </div>

          <ActivityFeed />
        </div>

        {/* Right Column */}
        <div className="home-sidebar">
          <CheckInCard />

          <div className="card home-section">
            <div className="section-header">
              <h2 className="section-title">班级日历</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={handlePrevMonth}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.2rem 0.5rem',
                    color: '#64748b',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  &lt;
                </button>
                <span className="section-subtitle">{monthLabel}</span>
                <button
                  onClick={handleNextMonth}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.2rem 0.5rem',
                    color: '#64748b',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                >
                  &gt;
                </button>
              </div>
            </div>
            {calendarError && <p className="small-muted" style={{ color: 'var(--error)' }}>{calendarError}</p>}
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
                          setSelectedDate(dateKey);
                          setEventForm((prev) => ({ ...prev, date: dateKey }));
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

              <div className="calendar-event-details">
                <div className="event-details-header">
                  <h4>{selectedDate}</h4>
                </div>
                <div className="event-details-list">
                  {(eventMap.get(selectedDate) ?? []).map((event) => (
                    <div key={event.id} className={`event-details-item ${event.importance ?? 'low'}`}>
                      <div className="event-details-title">{event.title}</div>
                      <div className="event-details-detail">{getEventDetail(event)}</div>
                      {canManage && (
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button className="btn btn-outline" onClick={() => handleEventEdit(event)}>编辑</button>
                          <button className="btn btn-outline" onClick={() => handleEventDelete(event.id)}>删除</button>
                        </div>
                      )}
                    </div>
                  ))}
                  {(eventMap.get(selectedDate) ?? []).length === 0 && (
                    <p className="small-muted">该日期暂无事件</p>
                  )}
                </div>
              </div>

              {events.length === 0 && <p className="small-muted">本月暂无活动安排</p>}
            </div>

            {canManage && (
              <form onSubmit={handleEventSubmit} style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">事件名称</label>
                  <input
                    className="form-input"
                    value={eventForm.title}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">日期</label>
                  <input
                    className="form-input"
                    type="date"
                    value={eventForm.date}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, date: event.target.value }))}
                    required
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">开始时间</label>
                    <input
                      className="form-input"
                      type="time"
                      value={eventForm.start_time}
                      onChange={(event) => setEventForm((prev) => ({ ...prev, start_time: event.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">结束时间</label>
                    <input
                      className="form-input"
                      type="time"
                      value={eventForm.end_time}
                      onChange={(event) => setEventForm((prev) => ({ ...prev, end_time: event.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">地点</label>
                  <input
                    className="form-input"
                    value={eventForm.location}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, location: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">备注</label>
                  <textarea
                    className="form-textarea"
                    value={eventForm.description}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, description: event.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">优先级</label>
                  <select
                    className="form-input"
                    value={eventForm.importance}
                    onChange={(event) => setEventForm((prev) => ({ ...prev, importance: event.target.value as 'low' | 'normal' | 'high' }))}
                  >
                    <option value="low">低</option>
                    <option value="normal">普通</option>
                    <option value="high">高</option>
                  </select>
                </div>
                <div className="form-actions">
                  {editingEventId && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        setEditingEventId(null);
                        setEventForm((prev) => ({
                          ...prev,
                          title: '',
                          start_time: '',
                          end_time: '',
                          location: '',
                          description: '',
                          is_all_day: false,
                          importance: 'normal',
                        }));
                      }}
                    >
                      取消编辑
                    </button>
                  )}
                  <button type="submit" className="btn btn-primary">
                    {editingEventId ? '更新事件' : '新增事件'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
