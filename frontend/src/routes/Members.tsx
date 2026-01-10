import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMembers } from '../api/members';
import type { UserPublic } from '../types/user';

function Members() {
  const [members, setMembers] = useState<UserPublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const response = await getMembers(searchQuery, page);
        setMembers(response.items);
        setTotal(response.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [searchQuery, page]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div>
      <h1>班级成员</h1>
      <hr style={{ border: 'none', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }} />

      <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="search-input"
          placeholder="搜索成员..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', maxWidth: '400px' }}
        />
      </form>

      {loading ? (
        <p>加载中...</p>
      ) : error ? (
        <p className="small-muted">{error}</p>
      ) : members.length === 0 ? (
        <p className="small-muted">没有找到成员</p>
      ) : (
        <>
          {members.map((member) => (
            <div
              className="card"
              key={member.id}
              onClick={() => navigate(`/users/${member.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                cursor: 'pointer',
                padding: '1rem',
                marginBottom: '1rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(4px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 23, 42, 0.06)';
              }}
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}
              >
                {member.nickname ? member.nickname[0].toUpperCase() : member.username[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {member.nickname || member.username}
                </div>
                <div className="small-muted">
                  @{member.username}
                  {member.class && ` · ${member.class}`}
                  {' · '}{member.stats.blog_count}篇博客
                </div>
              </div>
              <div>→</div>
            </div>
          ))}

          {total > members.length && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <button
                className="btn btn-outline"
                onClick={() => setPage(page + 1)}
                disabled={loading}
              >
                加载更多
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Members;
