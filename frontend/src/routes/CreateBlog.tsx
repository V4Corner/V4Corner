import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import React from 'react';
import { createBlog } from '../api/blogs';
import { useAuth } from '../contexts/AuthContext';
import RichTextEditor from '../components/RichTextEditor';

// 从HTML中提取纯文本字数
function getPlainTextLength(html: string): number {
  // 移除HTML标签
  const text = html
    .replace(/<[^>]*>/g, '') // 移除所有HTML标签
    .replace(/&nbsp;/g, ' ') // 替换&nbsp;
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

function CreateBlog() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_CONTENT_LENGTH = 5000; // 5千字限制
  const MAX_MEDIA_COUNT = 20; // 最大媒体文件数
  const MAX_MEDIA_SIZE_MB = 2 * 1024; // 2GB，单位MB

  // 实时统计
  const [textLength, setTextLength] = useState(0);
  const [mediaCount, setMediaCount] = useState(0);
  const [mediaSizeMB, setMediaSizeMB] = useState(0);

  // 存储已上传的媒体文件信息
  const mediaFilesRef = useRef<Map<string, number>>(new Map());

  // 处理媒体上传回调
  const handleMediaUpload = (url: string, size: number) => {
    mediaFilesRef.current.set(url, size);
  };

  // 获取剩余容量（字节）
  const getRemainingCapacity = () => {
    const currentUsage = mediaSizeMB * 1024 * 1024; // 转换为字节
    return (MAX_MEDIA_SIZE_MB * 1024 * 1024) - currentUsage; // 2GB - 当前使用量
  };

  // 当内容变化时，更新统计
  useEffect(() => {
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
      setLoading(true);
      setError('');

      const blog = await createBlog({ title, content, status: 'published' });

      // 跳转到博客详情页
      navigate(`/blogs/${blog.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
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
      setLoading(true);
      setError('');

      const blog = await createBlog({ title, content: content || '', status: 'draft' });

      // 跳转到博客列表页
      navigate('/blogs');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存草稿失败');
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
            disabled={loading}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="btn btn-outline"
            disabled={loading}
          >
            {loading ? '保存中...' : '保存草稿'}
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
