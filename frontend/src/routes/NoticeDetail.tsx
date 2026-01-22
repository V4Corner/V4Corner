import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getNotice, deleteNotice } from '../api/notice';
import { useAuth } from '../contexts/AuthContext';
import { formatMarkdown } from '../utils/markdown';
import type { NoticeDetail } from '../types/notice';

function NoticeDetail() {
  const { noticeId } = useParams<{ noticeId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [notice, setNotice] = useState<NoticeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!noticeId) return;

    const requestKey = `notice-fetch-${noticeId}`;
    const fetchTimestamp = sessionStorage.getItem(requestKey);
    const now = Date.now();

    if (fetchTimestamp && now - parseInt(fetchTimestamp) < 1000) {
      return;
    }

    sessionStorage.setItem(requestKey, now.toString());

    const fetchNotice = async () => {
      try {
        setLoading(true);
        const data = await getNotice(parseInt(noticeId));
        setNotice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
        sessionStorage.removeItem(requestKey);
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();
  }, [noticeId]);

  const handleEdit = () => {
    if (notice) {
      navigate(`/notices/${notice.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!notice || !currentUser) return;

    if (!confirm('确定要删除这条通知吗？')) return;

    try {
      await deleteNotice(notice.id);
      navigate('/notices');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <section>
        <p>加载中...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <p className="small-muted" style={{ color: 'var(--error)' }}>{error}</p>
      </section>
    );
  }

  if (!notice) {
    return (
      <section>
        <p className="small-muted">通知不存在</p>
      </section>
    );
  }

  return (
    <section style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* 面包屑导航 */}
      <div className="breadcrumb" style={{ marginBottom: '1.5rem' }}>
        <Link to="/notices" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
          通知列表
        </Link>
        {' > '}
        <span>{notice.title}</span>
      </div>

      <div className="card">
        {/* 标题和操作按钮 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
          <div style={{ flex: 1 }}>
            {notice.is_important && (
              <span style={{
                backgroundColor: '#ef4444',
                color: 'white',
                padding: '0.25rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 600,
                marginRight: '0.5rem'
              }}>
                重要
              </span>
            )}
            <h1 className="blog-title" style={{ display: 'inline', margin: 0 }}>
              {notice.title}
            </h1>
          </div>
          {notice.can_edit && (
            <div className="blog-actions" style={{ marginLeft: '1rem' }}>
              <button className="btn btn-outline" onClick={handleEdit}>
                编辑
              </button>
              <button className="btn btn-outline" onClick={handleDelete} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                删除
              </button>
            </div>
          )}
        </div>

        {/* 元信息 */}
        <div className="blog-header-info">
          <div>发布者：{notice.author}</div>
          <div>{formatDate(notice.published_at)}</div>
          <div>{notice.views}</div>
          {notice.updated_at && (
            <div>更新于：{formatDate(notice.updated_at)}</div>
          )}
        </div>

        <hr style={{ border: 'none', borderBottom: '1px solid var(--border)', margin: '1.5rem 0' }} />

        {/* 内容 */}
        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(notice.content) }}
        />
      </div>
    </section>
  );
}

export default NoticeDetail;
