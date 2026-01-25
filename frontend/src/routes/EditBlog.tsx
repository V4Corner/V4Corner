import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import React from 'react';
import { getBlog, updateBlog } from '../api/blogs';
import { getMediaSizes } from '../api/uploads';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';
import type { Blog } from '../types/blog';

// 从HTML中提取纯文本字数
function getPlainTextLength(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  return text.length;
}

// 统计媒体文件数量
function getMediaCount(html: string): number {
  const imgMatches = html.match(/<img[^>]+src="/g);
  const videoMatches = html.match(/<video[^>]*>/g);
  const imgCount = imgMatches ? imgMatches.length : 0;
  const videoCount = videoMatches ? videoMatches.length : 0;
  return imgCount + videoCount;
}

// 从 HTML 内容中提取所有媒体文件 URL
function extractMediaUrls(html: string): string[] {
  const urls: string[] = [];

  // 提取图片 URL
  const imgRegex = /<img[^>]+src="([^"]+)"/g;
  let match;
  while ((match = imgRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.includes('/static/blog/')) {
      urls.push(url.replace('http://localhost:8000', ''));
    }
  }

  // 提取视频 URL（支持 <video src=""> 和 <video><source src=""></video>）
  const videoSrcRegex = /<video[^>]*src="([^"]+)"/g;
  while ((match = videoSrcRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.includes('/static/blog/')) {
      urls.push(url.replace('http://localhost:8000', ''));
    }
  }

  const videoSourceRegex = /<source[^>]+src="([^"]+)"/g;
  while ((match = videoSourceRegex.exec(html)) !== null) {
    const url = match[1];
    if (url.includes('/static/blog/')) {
      urls.push(url.replace('http://localhost:8000', ''));
    }
  }

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

  // 存储已上传的媒体文件信息
  const mediaFilesRef = useRef<Map<string, number>>(new Map());

  const MAX_CONTENT_LENGTH = 5000; // 5千字限制
  const MAX_MEDIA_COUNT = 20; // 最大媒体文件数
  const MAX_MEDIA_SIZE_MB = 2 * 1024; // 2GB，单位MB

  // 实时统计
  const [textLength, setTextLength] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [mediaSizeMB, setMediaSizeMB] = useState(0);

  // 处理媒体上传回调
  const handleMediaUpload = (url: string, size: number) => {
    mediaFilesRef.current.set(url, size);
  };

  // 获取剩余容量（字节）
  const getRemainingCapacity = () => {
    const currentUsage = mediaSizeMB * 1024 * 1024; // 转换为字节
    return (MAX_MEDIA_SIZE_MB * 1024 * 1024) - currentUsage; // 2GB - 当前使用量
  };

  useEffect(() => {
    if (!blogId) return;

    const fetchBlog = async () => {
      try {
        setLoading(true);
        const data = await getBlog(parseInt(blogId));
        setBlog(data);
        setTitle(data.title);
        setContent(data.content);

        // 更新纯文本字数和媒体数量
        setTextLength(getPlainTextLength(data.content));
        setMediaCount(getMediaCount(data.content));

        // 保存原始媒体 URL
        const mediaUrls = extractMediaUrls(data.content);
        originalMediaUrlsRef.current = mediaUrls;

        // 获取已有媒体文件的大小
        let totalSize = 0;
        if (mediaUrls.length > 0) {
          try {
            const sizes = await getMediaSizes(mediaUrls);
            // 保存到 mediaFilesRef 并计算总大小
            Object.entries(sizes).forEach(([url, size]) => {
              if (size > 0) {
                mediaFilesRef.current.set(url, size);
                totalSize += size;
              }
            });
          } catch (err) {
            console.error('获取媒体文件大小失败:', err);
          }
        }
        // 设置媒体大小
        setMediaSizeMB(totalSize / (1024 * 1024));
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  // 当内容变化时，更新统计
  useEffect(() => {
    if (!content) return;

    // 更新纯文本字数
    setTextLength(getPlainTextLength(content));

    // 更新媒体数量
    setMediaCount(getMediaCount(content));

    // 从内容中提取所有媒体URL
    const urls: string[] = [];
    const imgRegex = /<img[^>]+src="([^"]+)"/g;
    const videoSrcRegex = /<video[^>]*src="([^"]+)"/g;
    const videoSourceRegex = /<source[^>]+src="([^"]+)"/g;

    let match;
    while ((match = imgRegex.exec(content)) !== null) {
      let url = match[1];
      // 移除 http://localhost:8000 前缀以匹配存储的 URL
      url = url.replace('http://localhost:8000', '');
      urls.push(url);
    }
    while ((match = videoSrcRegex.exec(content)) !== null) {
      let url = match[1];
      url = url.replace('http://localhost:8000', '');
      urls.push(url);
    }
    while ((match = videoSourceRegex.exec(content)) !== null) {
      let url = match[1];
      url = url.replace('http://localhost:8000', '');
      urls.push(url);
    }

    // 计算媒体文件总大小（从存储的大小信息中获取）
    let totalSize = 0;
    urls.forEach(url => {
      const size = mediaFilesRef.current.get(url);
      if (size) {
        totalSize += size;
      }
    });
    setMediaSizeMB(totalSize / (1024 * 1024)); // 转换为MB
  }, [content]);

  const handlePublish = async (e: React.FormEvent) => {
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
    if (textLength > MAX_CONTENT_LENGTH) {
      setError(`博客内容不能超过${MAX_CONTENT_LENGTH}字（当前${textLength}字）`);
      return;
    }
    if (mediaCount > MAX_MEDIA_COUNT) {
      setError(`媒体文件数量不能超过${MAX_MEDIA_COUNT}个（当前${mediaCount}个）`);
      return;
    }
    if (mediaSizeMB > MAX_MEDIA_SIZE_MB) {
      setError(`媒体文件总大小不能超过${MAX_MEDIA_SIZE_MB / 1024}GB（当前${mediaSizeMB.toFixed(1)}MB）`);
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

      // 更新博客为发布状态
      await updateBlog(parseInt(blogId), { title, content, status: 'published' });

      // 删除未使用的媒体文件
      await cleanupMedia(deletedUrls);

      // 跳转到博客详情页
      navigate(`/blogs/${blogId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!blogId) {
      setError('博客 ID 无效');
      return;
    }

    // 验证
    if (!title.trim()) {
      setError('请输入标题');
      return;
    }
    if (title.length > 200) {
      setError('标题不能超过200字符');
      return;
    }
    if (textLength > MAX_CONTENT_LENGTH) {
      setError(`博客内容不能超过${MAX_CONTENT_LENGTH}字（当前${textLength}字）`);
      return;
    }
    if (mediaCount > MAX_MEDIA_COUNT) {
      setError(`媒体文件数量不能超过${MAX_MEDIA_COUNT}个（当前${mediaCount}个）`);
      return;
    }
    if (mediaSizeMB > MAX_MEDIA_SIZE_MB) {
      setError(`媒体文件总大小不能超过${MAX_MEDIA_SIZE_MB / 1024}GB（当前${mediaSizeMB.toFixed(1)}MB）`);
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

      // 更新博客为草稿状态
      await updateBlog(parseInt(blogId), { title, content: content || '', status: 'draft' });

      // 删除未使用的媒体文件
      await cleanupMedia(deletedUrls);

      // 跳转到草稿箱
      navigate('/blogs/drafts');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存草稿失败');
    } finally {
      setSaving(false);
    }
  };

  const cleanupMedia = async (deletedUrls: string[]) => {
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
  };

  const handleCancel = () => {
    // 如果是草稿，返回草稿箱；否则返回博客详情页
    if (blog && blog.status === 'draft') {
      navigate('/blogs/drafts');
    } else if (blogId) {
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
        {blog.status === 'draft' ? (
          <>
            <Link to="/blogs/drafts" style={{ color: '#0f172a', textDecoration: 'none' }}>
              草稿箱
            </Link>
            {' > '}
            <span>编辑草稿</span>
          </>
        ) : (
          <>
            <Link to={`/blogs/${blogId}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
              {title}
            </Link>
            {' > '}
            <span>编辑</span>
          </>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>编辑博客</h1>
        {blog.status && (
          <p className="small-muted" style={{ marginTop: '0.25rem' }}>
            状态:{' '}
            <span style={{
              backgroundColor: blog.status === 'draft' ? '#fef3c7' : '#dcfce7',
              color: blog.status === 'draft' ? '#92400e' : '#166534',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}>
              {blog.status === 'draft' ? '草稿' : '已发布'}
            </span>
          </p>
        )}
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

      <div className="card" style={{ padding: '1.5rem' }}>
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
            onMediaUpload={handleMediaUpload}
            getRemainingCapacity={getRemainingCapacity}
          />
          <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <p className="small-muted" style={{ margin: 0, color: textLength > MAX_CONTENT_LENGTH * 0.9 ? '#dc2626' : '#64748b' }}>
              📝 纯文本字数: {textLength.toLocaleString()} / {MAX_CONTENT_LENGTH.toLocaleString()}
            </p>
            <p className="small-muted" style={{ margin: 0, color: mediaCount > MAX_MEDIA_COUNT * 0.9 ? '#dc2626' : '#64748b' }}>
              🖼️ 媒体文件: {mediaCount} / {MAX_MEDIA_COUNT}
            </p>
            <p className="small-muted" style={{ margin: 0, color: mediaSizeMB > MAX_MEDIA_SIZE_MB * 0.9 ? '#dc2626' : '#64748b' }}>
              💾 媒体大小: {mediaSizeMB.toFixed(1)} MB / {MAX_MEDIA_SIZE_MB / 1024} GB
            </p>
          </div>
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
            type="button"
            onClick={handleSaveDraft}
            className="btn btn-outline"
            disabled={saving}
          >
            {saving ? '保存中...' : '保存草稿'}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? '发布中...' : '发布博客'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditBlog;
