// 通知中心组件 - 下拉菜单形式显示通知列表

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as notificationsApi from '../api/notifications';
import type { NotificationWithTimeDisplay } from '../types/notification';

export default function NotificationCenter() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationWithTimeDisplay[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 加载未读数量
  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const response = await notificationsApi.getUnreadCount();
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error('加载未读数量失败:', error);
    }
  };

  // 加载通知列表
  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await notificationsApi.getNotifications({
        unread_only: false,
        page: 1,
        size: 10,
      });
      setNotifications(response.items);
      setUnreadCount(response.unread_count);
    } catch (error) {
      console.error('加载通知失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 定时刷新未读数量
  useEffect(() => {
    if (!user) return;

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000); // 每30秒刷新一次
    return () => clearInterval(interval);
  }, [user]);

  // 打开下拉菜单时加载通知
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // 标记单个通知为已读
  const handleMarkRead = async (notificationId: number) => {
    try {
      await notificationsApi.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('标记已读失败:', error);
    }
  };

  // 标记所有为已读
  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('标记全部已读失败:', error);
    }
  };

  // 清除已读通知
  const handleClearRead = async () => {
    if (!confirm('确定要清除所有已读通知吗？')) return;

    try {
      await notificationsApi.deleteNotifications(false);
      loadNotifications();
    } catch (error) {
      console.error('清除通知失败:', error);
    }
  };

  // 删除单个通知
  const handleDelete = async (notificationId: number) => {
    try {
      await notificationsApi.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      loadUnreadCount();
    } catch (error) {
      console.error('删除通知失败:', error);
    }
  };

  if (!user) return null;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* 通知铃铛按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ position: 'relative', padding: '0.5rem', color: '#374151', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* 未读数量徽章 */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 0.5rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            lineHeight: 1,
            color: 'white',
            transform: 'translate(25%, -25%)',
            backgroundColor: '#dc2626',
            borderRadius: '9999px'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          marginTop: '0.5rem',
          width: '384px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e2e8f0',
          zIndex: 50,
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* 头部 */}
          <div style={{
            padding: '0.75rem 1rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.125rem' }}>通知</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    fontSize: '0.875rem',
                    color: '#2563eb',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  全部已读
                </button>
              )}
              <button
                onClick={handleClearRead}
                style={{
                  fontSize: '0.875rem',
                  color: '#475569',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                清除已读
              </button>
            </div>
          </div>

          {/* 通知列表 */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>加载中...</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>暂无通知</div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'backgroundColor 0.2s',
                      backgroundColor: !notification.is_read ? '#eff6ff' : 'transparent',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (e.currentTarget.style) {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (e.currentTarget.style) {
                        e.currentTarget.style.backgroundColor = !notification.is_read ? '#eff6ff' : 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
                      {/* 通知内容 */}
                      <div
                        style={{ flex: 1, minWidth: 0 }}
                        onClick={() => {
                          if (!notification.is_read) {
                            handleMarkRead(notification.id);
                          }
                          if (notification.related_url) {
                            window.location.href = notification.related_url;
                          }
                        }}
                      >
                        <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>
                          {notification.title}
                        </div>
                        <div style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {notification.content}
                        </div>
                        <div style={{ color: '#9ca3af', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {notification.time_display}
                        </div>
                      </div>

                      {/* 删除按钮 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(notification.id);
                        }}
                        style={{
                          color: '#9ca3af',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#dc2626'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 底部链接 */}
          <div style={{
            padding: '0.5rem 1rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}>
            <a
              href="/notifications"
              style={{
                fontSize: '0.875rem',
                color: '#2563eb',
                textDecoration: 'none'
              }}
              onClick={() => setIsOpen(false)}
            >
              查看全部通知
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
