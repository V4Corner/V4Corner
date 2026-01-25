import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getUserBlogs } from '../api/users';
import type { UserPublic } from '../types/user';
import type { BlogListResponse } from '../types/blog';
import { useAuth } from '../contexts/AuthContext';
import BlogCard from '../components/BlogCard';
import SearchBar from '../components/SearchBar';
import BlogFilters, { BlogFiltersState } from '../components/BlogFilters';
import LikeButton from '../components/LikeButton';
import FavoriteButton from '../components/FavoriteButton';
import { formatNumber } from '../utils/formatNumber';

function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserPublic | null>(null);
  const [blogs, setBlogs] = useState<BlogListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const isOwnProfile = currentUser && user && currentUser.id === user.id;

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        const [userData, blogsData] = await Promise.all([
          getUserById(parseInt(userId)),
          getUserBlogs(parseInt(userId), {
            q: searchQuery || undefined,
            sort_by: filters.sortBy,
            sort_order: filters.sortOrder,
            date_from: filters.dateFrom || undefined,
            date_to: filters.dateTo || undefined,
          })
        ]);
        setUser(userData);
        setBlogs(blogsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId, searchQuery, filters]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // 处理筛选变化
  const handleFiltersChange = (newFilters: BlogFiltersState) => {
    setFilters(newFilters);
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
  };

  // 检查是否有活动筛选
  const hasActiveFilters =
    searchQuery !== '' || filters.dateFrom !== '' || filters.dateTo !== '' || filters.sortBy !== 'created_at' || filters.sortOrder !== 'desc';

  if (loading) {
    return <p>加载中...</p>;
  }

  if (error || !user) {
    return <p className="small-muted">{error || '用户不存在'}</p>;
  }

  return (
    <div className="user-profile">
      <div className="card">
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
          {/* Avatar Display */}
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              overflow: 'hidden',
              flexShrink: 0
            }}
          >
            {user.avatar_url ? (
              <img
                src={`http://localhost:8000${user.avatar_url}`}
                alt={`${user.username}'s avatar`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>{user.nickname ? user.nickname[0].toUpperCase() : user.username[0].toUpperCase()}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              {user.nickname || user.username}
            </div>
            <div className="small-muted">@{user.username}</div>
            {user.bio && <p style={{ marginTop: '1rem', lineHeight: 1.6 }}>{user.bio}</p>}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginTop: '1.5rem'
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {user.stats.blog_count}
                </div>
                <div className="small-muted" style={{ marginTop: '0.25rem' }}>发布博客</div>
              </div>
              <div
                style={{
                  textAlign: 'center',
                  padding: '1rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}
              >
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>
                  {user.stats.total_views}
                </div>
                <div className="small-muted" style={{ marginTop: '0.25rem' }}>总阅读量</div>
              </div>
            </div>
          </div>
        </div>

        {blogs?.items && blogs.items.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0' }}>
              TA 的博客
            </h2>

            {/* 搜索栏 */}
            <div style={{ marginBottom: '1rem' }}>
              <SearchBar onSearch={handleSearch} defaultValue={searchQuery} />
            </div>

            {/* 筛选面板 */}
            <BlogFilters
              onFiltersChange={handleFiltersChange}
              resultCount={blogs.total}
              hasActiveFilters={hasActiveFilters}
              onReset={handleResetFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* 博客列表 */}
            {viewMode === 'grid' ? (
              <div className="card-grid">
                {blogs.items.map((blog) => (
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
                {blogs.items.map((blog, index) => (
                  <div
                    key={blog.id}
                    style={{
                      padding: '1rem 1.2rem',
                      borderBottom: index < blogs.items.length - 1 ? '1px solid #e2e8f0' : 'none',
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
          </div>
        )}

        {blogs?.items && blogs.items.length === 0 && (
          <p className="small-muted" style={{ marginTop: '2rem' }}>
            {hasActiveFilters ? '没有找到匹配的博客' : '还没有发布博客'}
          </p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
