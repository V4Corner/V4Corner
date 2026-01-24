import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getDrafts, deleteBlog, updateBlog } from '../api/blogs';
import { useAuth } from '../contexts/AuthContext';
import type { Blog } from '../types/blog';

function Drafts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDrafts()
      .then((data) => setDrafts(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (blogId: number) => {
    if (!confirm('确定要删除这篇草稿吗？此操作无法撤销。')) {
      return;
    }

    try {
      await deleteBlog(blogId);
      // 从列表中移除
      setDrafts(drafts.filter(d => d.id !== blogId));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    }
  };

  const handlePublish = async (blogId: number) => {
    if (!confirm('确定要发布这篇草稿吗？')) {
      return;
    }

    try {
      const blog = await updateBlog(blogId, { status: 'published' });
      // 从列表中移除
      setDrafts(drafts.filter(d => d.id !== blogId));
      // 跳转到博客详情页
      navigate(`/blogs/${blogId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发布失败');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 2) return '昨天';
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString('zh-CN');
  };

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>请先登录</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {/* 面包屑导航 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <Link to="/blogs" style={{ fontSize: '1.5rem', textDecoration: 'none', color: '#0f172a' }}>
          ←
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>我的草稿箱</h1>
          <p className="small-muted" style={{ marginTop: '0.25rem', marginBottom: 0 }}>
            {drafts.length} 篇草稿
          </p>
        </div>
      </div>

      <hr style={{ border: 'none', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }} />

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

      {drafts.length === 0 ? (
        <div
          className="card"
          style={{
            padding: '3rem',
            textAlign: 'center',
            backgroundColor: '#f8fafc'
          }}
        >
          <p style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>暂无草稿</p>
          <p className="small-muted" style={{ marginBottom: '1.5rem' }}>
            还没有保存的草稿，点击"写博客"创建新博客时可以保存为草稿
          </p>
          <Link to="/blogs/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            去写博客
          </Link>
        </div>
      ) : (
        <div>
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="card"
              style={{
                marginBottom: '1rem',
                padding: '1.5rem'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '0.75rem'
                }}
              >
                <h3 style={{ margin: 0 }}>{draft.title || '未命名草稿'}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    to={`/blogs/${draft.id}/edit`}
                    className="btn btn-outline"
                    style={{ textDecoration: 'none', padding: '0.5rem 1rem' }}
                  >
                    继续编辑
                  </Link>
                  <button
                    onClick={() => handlePublish(draft.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    发布
                  </button>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    删除
                  </button>
                </div>
              </div>
              <p className="small-muted" style={{ marginBottom: '1rem' }}>
                最后编辑：{formatDate(draft.updated_at || draft.created_at)}
              </p>
              <p style={{ color: '#475569', margin: 0 }}>
                {draft.content ? draft.content.substring(0, 100) + (draft.content.length > 100 ? '...' : '') : '（此草稿暂无内容）'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Drafts;
