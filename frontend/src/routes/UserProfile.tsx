import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getUserBlogs } from '../api/users';
import type { UserPublic } from '../types/user';
import type { BlogListResponse } from '../types/blog';
import { useAuth } from '../contexts/AuthContext';

function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserPublic | null>(null);
  const [blogs, setBlogs] = useState<BlogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const [userData, blogsData] = await Promise.all([
          getUserById(parseInt(userId)),
          getUserBlogs(parseInt(userId))
        ]);
        setUser(userData);
        setBlogs(blogsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return <p>加载中...</p>;
  }

  if (error || !user) {
    return <p className="small-muted">{error || '用户不存在'}</p>;
  }

  return (
    <div className="user-profile">
      <div className="card">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700
            }}
          >
            {user.nickname ? user.nickname[0].toUpperCase() : user.username[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {user.nickname || user.username}
            </div>
            <div className="small-muted">@{user.username}</div>
            {user.bio && <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>{user.bio}</p>}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginTop: '1.5rem'
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {user.stats.blog_count}
                </div>
                <div className="small-muted" style={{ marginTop: '0.25rem' }}>发布博客</div>
              </div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {user.stats.total_views}
                </div>
                <div className="small-muted" style={{ marginTop: '0.25rem' }}>总阅读量</div>
              </div>
            </div>
          </div>
        </div>

        {blogs && blogs.items.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' }}>
              TA 的博客
            </h2>
            <div className="card-grid">
              {blogs.items.map((blog) => (
                <article
                  className="card"
                  key={blog.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/blogs/${blog.id}`)}
                >
                  <h3 style={{ marginTop: 0 }}>{blog.title}</h3>
                  <p className="small-muted">{new Date(blog.created_at).toLocaleDateString()}</p>
                  <p className="small-muted">{blog.excerpt}</p>
                </article>
              ))}
            </div>
          </div>
        )}

        {blogs && blogs.items.length === 0 && (
          <p className="small-muted" style={{ marginTop: '2rem' }}>
            还没有发布博客
          </p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
