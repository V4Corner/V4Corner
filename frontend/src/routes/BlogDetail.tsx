import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBlog, deleteBlog } from '../api/blogs';
import { useAuth } from '../contexts/AuthContext';
import { formatMarkdown } from '../utils/markdown';
import type { Blog } from '../types/blog';

function BlogDetail() {
  const { blogId } = useParams<{ blogId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await getBlog(parseInt(blogId));
        setBlog(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  const handleEdit = () => {
    if (blog) {
      navigate(`/blogs/${blog.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!blog || !currentUser) return;

    try {
      await deleteBlog(blog.id);
      navigate('/blogs');
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
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>加载中...</p>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p className="small-muted">{error || '博客不存在'}</p>
      </div>
    );
  }

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* 面包屑导航 */}
      <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        <Link to="/blogs" style={{ color: '#0f172a', textDecoration: 'none' }}>
          博客首页
        </Link>
        {' > '}
        <span>{blog.title}</span>
      </div>

      {/* 博客内容卡片 */}
      <div className="card" style={{ padding: '2rem' }}>
        {/* 博客头部 */}
        <header style={{ marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', lineHeight: 1.3 }}>{blog.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer'
              }}
              onClick={() => navigate(`/users/${blog.author_id}`)}
            >
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
              <span style={{ fontWeight: 500 }}>{blog.author}</span>
            </div>

            <span className="small-muted">·</span>

            <span className="small-muted">
              {formatDate(blog.created_at)}
            </span>

            <span className="small-muted">·</span>

            <span className="small-muted">{blog.views} 次阅读</span>

            {blog.updated_at && blog.updated_at !== blog.created_at && (
              <>
                <span className="small-muted">·</span>
                <span className="small-muted">已编辑</span>
              </>
            )}

            {/* 编辑/删除按钮 */}
            {blog.is_owner && (
              <>
                <div style={{ flex: 1 }}></div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handleEdit}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                  >
                    编辑
                  </button>
                  {!deleteConfirm ? (
                    <button
                      onClick={() => setDeleteConfirm(true)}
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
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setDeleteConfirm(false)}
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                      >
                        取消
                      </button>
                      <button
                        onClick={handleDelete}
                        className="btn"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          backgroundColor: '#dc2626',
                          color: 'white',
                          border: '1px solid #b91c1c'
                        }}
                      >
                        确认删除
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </header>

        {/* 错误提示 */}
        {error && (
          <div
            style={{
              padding: '1rem',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              borderRadius: '8px',
              marginBottom: '1.5rem'
            }}
          >
            {error}
          </div>
        )}

        {/* Markdown 内容 */}
        <div
          className="markdown-content"
          style={{
            lineHeight: 1.8,
            fontSize: '1.05rem'
          }}
          dangerouslySetInnerHTML={{ __html: formatMarkdown(blog.content) }}
        />
      </div>
    </article>
  );
}

export default BlogDetail;
