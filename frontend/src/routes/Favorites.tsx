import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFavorites } from '../api/favorites';
import { useAuth } from '../contexts/AuthContext';
import type { BlogListItem } from '../types/blog';
import BlogCard from '../components/BlogCard';

function Favorites() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const size = 20;

  useEffect(() => {
    // 等待认证状态加载完成
    if (isLoading) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchFavorites = async () => {
      try {
        setLoading(true);
        const data = await getAllFavorites(page, size);
        setBlogs(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isAuthenticated, isLoading, page, navigate]);

  // 显示全局加载中
  if (isLoading || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p className="small-muted">{error}</p>
      </div>
    );
  }

  return (
    <section>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0 }}>我的收藏</h1>
        <p className="small-muted" style={{ marginTop: '0.5rem' }}>你收藏的博客文章</p>
      </div>

      <div className="card-grid">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
        {blogs.length === 0 && (
          <p className="small-muted">还没有收藏任何文章，快去收藏喜欢的博客吧！</p>
        )}
      </div>

      {/* 分页 */}
      {total > size && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          <button
            className="btn btn-outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            上一页
          </button>
          <span className="small-muted" style={{ padding: '0.5rem 1rem' }}>
            第 {page} 页，共 {Math.ceil(total / size)} 页
          </span>
          <button
            className="btn btn-outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / size)}
          >
            下一页
          </button>
        </div>
      )}
    </section>
  );
}

export default Favorites;
