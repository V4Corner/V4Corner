import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { getBlogs, getDrafts } from '../api/blogs';
import BlogCard from '../components/BlogCard';
import SearchBar from '../components/SearchBar';
import BlogFilters, { BlogFiltersState } from '../components/BlogFilters';
import LikeButton from '../components/LikeButton';
import FavoriteButton from '../components/FavoriteButton';
import { useAuth } from '../contexts/AuthContext';
import type { Blog } from '../types/blog';
import { formatNumber } from '../utils/formatNumber';

function Blogs() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [draftCount, setDraftCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // 搜索和筛选状态
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<BlogFiltersState>({
    sortBy: 'created_at',
    sortOrder: 'desc',
    dateFrom: '',
    dateTo: '',
  });

  // 视图模式
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 加载博客列表
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const data = await getBlogs({
          status: 'published',
          q: searchQuery || undefined,
          sort_by: filters.sortBy,
          sort_order: filters.sortOrder,
          date_from: filters.dateFrom || undefined,
          date_to: filters.dateTo || undefined,
          page,
          size: pageSize,
        });
        setBlogs(data.items);
        setTotal(data.total);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [searchQuery, filters, page]);

  // 加载草稿数量
  useEffect(() => {
    if (isAuthenticated && user) {
      getDrafts()
        .then((data) => setDraftCount(data.total))
        .catch(() => setDraftCount(0));
    }
  }, [isAuthenticated, user]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1); // 重置到第一页
  };

  // 处理筛选变化
  const handleFiltersChange = (newFilters: BlogFiltersState) => {
    setFilters(newFilters);
    setPage(1); // 重置到第一页
  };

  // 重置筛选
  const handleResetFilters = () => {
    setSearchQuery('');
    setFilters({
      sortBy: 'created_at',
      sortOrder: 'desc',
      dateFrom: '',
      dateTo: '',
    });
    setPage(1); // 重置到第一页
  };

  // 检查是否有活动筛选
  const hasActiveFilters =
    searchQuery !== '' || filters.dateFrom !== '' || filters.dateTo !== '' || filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc';

  if (loading && blogs.length === 0) return <p>加载中...</p>;
  if (error) return <p className="small-muted">{error}</p>;

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>博客</h1>
          <p className="small-muted" style={{ marginTop: '0.5rem' }}>来自同学们的文章</p>
        </div>
        {isAuthenticated && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/blogs/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              写博客
            </Link>
            <Link to="/blogs/drafts" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              草稿箱{draftCount > 0 && `(${draftCount})`}
            </Link>
          </div>
        )}
      </div>

      {/* 搜索栏 */}
      <div style={{ marginBottom: '1rem' }}>
        <SearchBar onSearch={handleSearch} defaultValue={searchQuery} />
      </div>

      {/* 筛选面板 */}
      <BlogFilters
        onFiltersChange={handleFiltersChange}
        resultCount={total}
        hasActiveFilters={hasActiveFilters}
        onReset={handleResetFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 博客列表 */}
      {loading ? (
        <p>加载中...</p>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="card-grid">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          ) : (
            <div
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden',
              }}
            >
              {blogs.map((blog, index) => (
                <div
                  key={blog.id}
                  style={{
                    padding: '1rem 1.2rem',
                    borderBottom: index < blogs.length - 1 ? '1px solid #e2e8f0' : 'none',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    alignItems: 'center',
                  }}
                >
                  {/* 左侧信息 */}
                  <div style={{ minWidth: 0 }}>
                    <h3
                      style={{
                        margin: '0 0 0.4rem 0',
                        fontSize: '1.1rem',
                        fontWeight: 600,
                        color: '#1e293b',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                      }}
                      onClick={() => navigate(`/blogs/${blog.id}`)}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#1e293b')}
                    >
                      {blog.title}
                    </h3>
                    <p
                      className="small-muted"
                      style={{
                        margin: '0 0 0.6rem 0',
                        fontSize: '0.9rem',
                        lineHeight: '1.5',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                      onClick={() => navigate(`/blogs/${blog.id}`)}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '')}
                    >
                      {blog.excerpt}
                    </p>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.25rem',
                        alignItems: 'center',
                        fontSize: '0.85rem',
                        color: '#64748b',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          backgroundColor: '#0f172a',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          overflow: 'hidden',
                          flexShrink: 0
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
                      <Link
                        to={`/users/${blog.author_id}`}
                        style={{
                          color: '#64748b',
                          textDecoration: 'none',
                          cursor: 'pointer',
                          maxWidth: '7em',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#3b82f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                      >
                        {blog.author}
                      </Link>
                      <span>•</span>
                      <span>{new Date(blog.created_at).toLocaleDateString('zh-CN')}</span>
                      <span>•</span>
                      <span>{formatNumber(blog.views)} 次阅读</span>
                    </div>
                  </div>

                  {/* 右侧操作按钮 */}
                  <div
                    style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <LikeButton blogId={blog.id} isLiked={blog.is_liked} likesCount={blog.likes_count} size="sm" />
                    <FavoriteButton blogId={blog.id} isFavorited={blog.is_favorited} favoritesCount={blog.favorites_count} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
          {blogs.length === 0 && (
            <p className="small-muted">
              {hasActiveFilters ? '没有找到匹配的博客' : '还没有博客，快来发布第一篇文章吧！'}
            </p>
          )}

          {/* 分页 */}
          {total > pageSize && (
            <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '0.5rem', alignItems: 'center' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem' }}
              >
                上一页
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', color: '#64748b' }}>
                第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
              </span>
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                disabled={page >= Math.ceil(total / pageSize)}
                className="btn btn-outline"
                style={{ padding: '0.5rem 1rem' }}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Blogs;
