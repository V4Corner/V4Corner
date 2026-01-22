import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotices } from '../api/notice';
import type { NoticeListItem } from '../types/notice';

function NoticeList() {
  const navigate = useNavigate();

  const [notices, setNotices] = useState<NoticeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadNotices(currentPage);
  }, [currentPage]);

  const loadNotices = (page: number) => {
    setLoading(true);
    setError(null);

    getNotices({ page, size: pageSize })
      .then((data) => {
        setNotices(data.items);
        setTotal(data.total);
        setTotalPages(Math.ceil(data.total / pageSize));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) return (
    <section>
      <h1>班级通知</h1>
      <p className="small-muted">加载中...</p>
    </section>
  );

  if (error) return (
    <section>
      <h1>班级通知</h1>
      <p className="small-muted" style={{ color: 'var(--error)' }}>{error}</p>
    </section>
  );

  return (
    <section>
      <div>
        <h1 style={{ margin: 0 }}>班级通知</h1>
        <p className="small-muted" style={{ marginTop: '0.5rem' }}>共 {total} 条通知</p>
      </div>

      <hr style={{ border: 'none', borderBottom: '2px solid var(--border)', margin: '1.5rem 0' }} />

      {notices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p className="small-muted">暂无通知</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notices.map((notice) => (
            <div
              key={notice.id}
              className="card"
              onClick={() => navigate(`/notices/${notice.id}`)}
              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.12)';
                e.currentTarget.style.borderColor = 'var(--primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
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
                  <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', display: 'inline' }}>
                    {notice.title}
                  </h3>
                </div>
                <div style={{ color: 'var(--secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {notice.date_display}
                </div>
              </div>
              <p style={{ color: 'var(--secondary)', fontSize: '0.9rem', margin: '0' }}>
                {notice.excerpt}
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--secondary)' }}>
                <span>{notice.author}</span>
                <span>浏览 {notice.views}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: '0.5rem 1rem' }}
          >
            上一页
          </button>
          <span style={{ color: 'var(--secondary)' }}>
            第 {currentPage} / {totalPages} 页
          </span>
          <button
            className="btn btn-outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: '0.5rem 1rem' }}
          >
            下一页
          </button>
        </div>
      )}
    </section>
  );
}

export default NoticeList;
