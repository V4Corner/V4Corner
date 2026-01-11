import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBlog } from '../api/blogs';
import { useAuth } from '../contexts/AuthContext';
import { formatMarkdown } from '../utils/markdown';

function CreateBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(true);

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>创建博客</h1>
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
              <label htmlFor="content" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                内容 (支持 Markdown) *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# 开始写作...

## Markdown 语法提示

- **粗体**: **文字**
- *斜体*: *文字*
- 标题: # 一级标题, ## 二级标题, ### 三级标题
- 代码: `代码` 或 ```代码块```
- 链接: [文字](链接地址)
- 列表: * 项目
- 图片: ![描述](图片地址)"
                rows={25}
                disabled={loading}
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
              {title || content ? (
                <div className="markdown-content">
                  {title && (
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
                  )}
                  {content && (
                    <div
                      style={{ lineHeight: 1.8, fontSize: '1.05rem' }}
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
                    />
                  )}
                  {!title && !content && (
                    <p className="small-muted">在左侧输入内容，这里将实时显示预览...</p>
                  )}
                </div>
              ) : (
                <p className="small-muted">在左侧输入内容，这里将实时显示预览...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CreateBlog;
