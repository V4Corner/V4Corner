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
    <article style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* 面包屑导航 */}
      <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <Link to="/notices" style={{ color: '#0f172a', textDecoration: 'none' }}>
          通知首页
        </Link>
        {' > '}
        <span>{notice.title}</span>
      </div>

      {/* 通知内容 */}
      <div className="card" style={{ padding: '2rem' }}>
        {/* 第一部分：标题、作者、日期 */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.3 }}>
            {notice.is_important && (
              <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: '#ef4444',
                marginRight: '0.5rem',
                verticalAlign: 'middle',
                marginTop: '-0.1rem'
              }}>
              </span>
            )}
            {notice.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.9rem',
                fontWeight: 600,
                overflow: 'hidden'
              }}
            >
              <span>{notice.author[0].toUpperCase()}</span>
            </div>

            <span style={{ fontWeight: 500 }}>{notice.author}</span>

            <span className="small-muted">·</span>

            <span className="small-muted">
              {formatDate(notice.published_at)}
            </span>

            {notice.updated_at && (
              <>
                <span className="small-muted">·</span>
                <span className="small-muted">更新于 {formatDate(notice.updated_at)}</span>
              </>
            )}

            {/* 编辑/删除按钮 */}
            {notice.can_edit && (
              <>
                <div style={{ flex: 1 }}></div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={handleEdit}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定要删除这条通知吗？')) {
                        handleDelete();
                      }
                    }}
                    className="btn"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      backgroundColor: '#fee2e2',
                      color: '#991b1b',
                      border: '1px solid #fecaca'
                    }}
                  >
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 分隔线 */}
        <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: '2rem' }}></div>

        {/* 正文 */}
        <div
          className="rich-text-content"
          style={{
            lineHeight: 1.8,
            fontSize: '1.05rem',
            marginBottom: '2rem'
          }}
          dangerouslySetInnerHTML={{ __html: formatMarkdown(notice.content) }}
        />

        {/* 错误提示 */}
        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginTop: '1.5rem'
            }}
          >
            {error}
          </div>
        )}
      </div>
    </article>
  );
}

export default NoticeDetail;
