import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getBlogs } from '../api/blogs';
import BlogCard from '../components/BlogCard';
import { useAuth } from '../contexts/AuthContext';
import type { Blog } from '../types/blog';

function Blogs() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBlogs()
      .then((data) => setBlogs(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
          <Link to="/blogs/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            写博客
          </Link>
        )}
      </div>

      <div className="card-grid">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
        {blogs.length === 0 && <p>还没有博客，等待后端API连接...</p>}
      </div>
    </section>
  );
}

export default Blogs;
