import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getBlogs, getDrafts } from '../api/blogs';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../contexts/AuthContext';
import type { Blog } from '../types/blog';

function Blogs() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [draftCount, setDraftCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 加载博客列表
    getBlogs({ status: 'published' })
      .then((data) => setBlogs(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    // 如果已登录，加载草稿数量
    if (isAuthenticated && user) {
      getDrafts()
        .then((data) => setDraftCount(data.total))
        .catch(() => setDraftCount(0));
    }
  }, [isAuthenticated, user]);

  if (loading) return <p>加载中...</p>;
  if (error) return <p className="small-muted">{error}</p>;

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>博客</h1>
          <p className="small-muted" style={{ marginTop: '0.5rem' }}>来自同学们的文章</p>
        </div>
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/blogs/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              写博客
            </Link>
            <Link to="/blogs/drafts" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              草稿箱{draftCount > 0 && `(${draftCount})`}
            </Link>
          </div>
        )}
      </div>

      <div className="card-grid">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
        {blogs.length === 0 && <p className="small-muted">还没有博客，快来发布第一篇文章吧！</p>}
      </div>
    </section>
  );
}

export default Blogs;
