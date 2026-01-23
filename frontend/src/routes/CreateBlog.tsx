import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createBlog } from '../api/blogs';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

function CreateBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      setLoading(true);
      setError('');

      const blog = await createBlog({ title, content });

      // 跳转到博客详情页
      navigate(`/blogs/${blog.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/blogs');
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>请先登录</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* 面包屑导航 */}
      <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <Link to="/blogs" style={{ color: '#0f172a', textDecoration: 'none' }}>
          博客首页
        </Link>
        {' > '}
        <span>创建博客</span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>创建博客</h1>
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
            disabled={loading}
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            内容 *
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="开始写作... 可以插入图片、视频等多媒体内容"
            editable={!loading}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleCancel}
            className="btn btn-outline"
            disabled={loading}
          >
            取消
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? '发布中...' : '发布博客'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateBlog;
