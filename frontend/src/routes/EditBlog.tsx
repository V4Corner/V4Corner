import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBlog, updateBlog } from '../api/blogs';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import type { Blog } from '../types/blog';

// 从 HTML 内容中提取所有媒体文件 URL
function extractMediaUrls(html: string): string[] {
  const urls: string[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 提取图片 URL
  const images = doc.querySelectorAll('img');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.includes('/static/blog/')) {
      urls.push(src.replace('http://localhost:8000', ''));
    }
  });

  // 提取视频 URL
  const videos = doc.querySelectorAll('video');
  videos.forEach(video => {
    const src = video.getAttribute('src');
    if (src && src.includes('/static/blog/')) {
      urls.push(src.replace('http://localhost:8000', ''));
    }
  });

  return urls;
}

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

  // 保存原始媒体 URL 列表
  const originalMediaUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await getBlog(parseInt(blogId));
        setBlog(data);
        setTitle(data.title);
        setContent(data.content);

        // 保存原始媒体 URL
        originalMediaUrlsRef.current = extractMediaUrls(data.content);
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

      // 获取当前内容的媒体 URL
      const currentMediaUrls = extractMediaUrls(content);

      // 找出被删除的媒体 URL
      const deletedUrls = originalMediaUrlsRef.current.filter(
        url => !currentMediaUrls.includes(url)
      );

      // 更新博客
      await updateBlog(parseInt(blogId), { title, content });

      // 删除未使用的媒体文件
      if (deletedUrls.length > 0) {
        try {
          const token = localStorage.getItem('access_token');
          console.log('准备删除的媒体文件:', deletedUrls);

          const response = await fetch('http://localhost:8000/api/uploads/media', {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ urls: deletedUrls }),
          });

          console.log('删除响应状态:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('删除媒体文件失败:', errorText);
          } else {
            console.log('媒体文件删除成功');
          }

          // 显示清理提示
          if (deletedUrls.length > 0) {
            const cleanupMsg = document.createElement('div');
            cleanupMsg.textContent = `🧹 已清理 ${deletedUrls.length} 个未使用的媒体文件`;
            cleanupMsg.style.cssText = 'position: fixed; bottom: 20px; right: 20px; background: #22c55e; color: white; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';
            document.body.appendChild(cleanupMsg);
            setTimeout(() => cleanupMsg.remove(), 3000);
          }
        } catch (err) {
          console.error('清理媒体文件失败:', err);
          // 不阻止保存，只记录错误
        }
      } else {
        console.log('没有需要删除的媒体文件');
      }

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
      {/* 面包屑导航 */}
      <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '1rem' }}>
        <Link to="/blogs" style={{ color: '#0f172a', textDecoration: 'none' }}>
          博客首页
        </Link>
        {' > '}
        <Link to={`/blogs/${blogId}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
          {title}
        </Link>
        {' > '}
        <span>编辑</span>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>编辑博客</h1>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
            内容 *
          </label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="开始写作... 可以插入图片、视频等多媒体内容"
            editable={!saving}
          />
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
  );
}

export default EditBlog;
