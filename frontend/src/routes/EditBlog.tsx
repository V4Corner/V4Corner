import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBlog, updateBlog } from '../api/blogs';
import { useAuth } from '../contexts/AuthContext';
import { formatMarkdown } from '../utils/markdown';
import type { Blog } from '../types/blog';

function EditBlog() {
  const { blogId } = useParams<{ blogId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await getBlog(parseInt(blogId));
        setBlog(data);
        setTitle(data.title);
        setContent(data.content);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!blogId) {
      setError('博客 ID 无效');
      return;
    }

    // 验证
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }
    if (!content.trim()) {
      setError('请输入内容');
      return;
    }
    if (title.length > 200) {
      setError('标题不能超过200字符');
      return;
    }

    try {
      setSaving(true);
      setError('');

      await updateBlog(parseInt(blogId), { title, content });

      // 跳转到博客详情页
      navigate(`/blogs/${blogId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (blogId) {
      navigate(`/blogs/${blogId}`);
    } else {
      navigate('/blogs');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>加载中...</p>
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p className="small-muted">{error}</p>
      </div>
    );
  }

  if (!blog) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p className="small-muted">博客不存在</p>
      </div>
    );
  }

  // 检查权限
  if (!blog.is_owner) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>你没有权限编辑此博客</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>编辑博客</h1>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="btn btn-outline"
        >
          {showPreview ? '隐藏预览' : '显示预览'}
        </button>
      </div>

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

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* 编辑区 */}
        <div style={{ flex: showPreview ? 1 : '1 1 100%', maxWidth: showPreview ? '50%' : '100%' }}>
          <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                标题 *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入博客标题"
                maxLength={200}
                disabled={saving}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 500
                }}
              />
              <p className="small-muted" style={{ marginTop: '0.25rem' }}>
                {title.length}/200 字符
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                内容 (支持 Markdown) *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# 开始写作..."
                rows={25}
                disabled={saving}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontFamily: 'Consolas, Monaco, Courier New, monospace',
                  lineHeight: 1.6,
                  resize: 'vertical'
                }}
              />
              <p className="small-muted" style={{ marginTop: '0.25rem' }}>
                {content.length} 字符
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleCancel}
                className="btn btn-outline"
                disabled={saving}
              >
                取消
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          </form>
        </div>

        {/* 预览区 */}
        {showPreview && (
          <div
            style={{
              flex: 1,
              maxWidth: '50%',
              position: 'sticky',
              top: '1rem'
            }}
          >
            <div className="card" style={{ padding: '2rem' }}>
              <h2 style={{ marginTop: 0, paddingBottom: '1rem', borderBottom: '2px solid #e2e8f0' }}>
                预览
              </h2>
              <div className="markdown-content">
                <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
                <div
                  style={{ lineHeight: 1.8, fontSize: '1.05rem' }}
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditBlog;
