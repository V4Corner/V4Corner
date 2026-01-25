import { useState } from 'react';

interface BlogFiltersProps {
  onFiltersChange: (filters: BlogFiltersState) => void;
  resultCount?: number;
  hasActiveFilters: boolean;
  onReset: () => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

export interface BlogFiltersState {
  sortBy: 'created_at' | 'views' | 'likes' | 'favorites';
  sortOrder: 'asc' | 'desc';
  dateFrom: string;
  dateTo: string;
}

function BlogFilters({ onFiltersChange, resultCount, hasActiveFilters, onReset, viewMode, onViewModeChange }: BlogFiltersProps) {
  const [sortBy, setSortBy] = useState<BlogFiltersState['sortBy']>('created_at');
  const [sortOrder, setSortOrder] = useState<BlogFiltersState['sortOrder']>('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expanded, setExpanded] = useState(false);

  const handleApply = () => {
    onFiltersChange({
      sortBy,
      sortOrder,
      dateFrom,
      dateTo,
    });
  };

  const handleSortChange = (value: BlogFiltersState['sortBy']) => {
    setSortBy(value);
    onFiltersChange({
      sortBy: value,
      sortOrder,
      dateFrom,
      dateTo,
    });
  };

  const handleSortOrderToggle = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);
    onFiltersChange({
      sortBy,
      sortOrder: newOrder,
      dateFrom,
      dateTo,
    });
  };

  const handleReset = () => {
    setSortBy('created_at');
    setSortOrder('desc');
    setDateFrom('');
    setDateTo('');
    onReset();
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* 排序和筛选按钮 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* 排序选择 */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as BlogFiltersState['sortBy'])}
            style={{
              padding: '0.5rem 2rem 0.5rem 0.8rem',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '0.9rem',
              cursor: 'pointer',
              backgroundColor: 'white',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%2364748b\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
            }}
          >
            <option value="created_at">发布时间</option>
            <option value="views">浏览量</option>
            <option value="likes">点赞数</option>
            <option value="favorites">收藏数</option>
          </select>

          {/* 排序方向 */}
          <button
            onClick={handleSortOrderToggle}
            className="btn"
            style={{
              padding: '0.5rem 0.8rem',
              fontSize: '0.9rem',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
            title={sortOrder === 'desc' ? '降序' : '升序'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: sortOrder === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)' }}>
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
            <span style={{ fontSize: '0.85rem' }}>{sortOrder === 'desc' ? '降序' : '升序'}</span>
          </button>

          {/* 日期筛选按钮 */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="btn"
            style={{
              padding: '0.5rem 0.8rem',
              fontSize: '0.9rem',
              border: '1px solid #e2e8f0',
              backgroundColor: expanded ? '#f1f5f9' : 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>日期筛选</span>
          </button>

          {/* 重置按钮 */}
          {hasActiveFilters && (
            <button onClick={handleReset} className="btn" style={{ padding: '0.5rem 0.8rem', fontSize: '0.9rem' }}>
              🔄 重置筛选
            </button>
          )}

          {/* 结果计数 */}
          {resultCount !== undefined && (
            <span className="small-muted" style={{ fontSize: '0.9rem' }}>
              找到 {resultCount} 篇博客
            </span>
          )}
        </div>

        {/* 视图切换 */}
        <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
          <button
            onClick={() => onViewModeChange('grid')}
            className="btn"
            style={{
              padding: '0.5rem 0.8rem',
              fontSize: '0.9rem',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? '#3b82f6' : 'white',
              color: viewMode === 'grid' ? 'white' : '#64748b',
              borderRadius: 0,
            }}
            title="方格视图"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className="btn"
            style={{
              padding: '0.5rem 0.8rem',
              fontSize: '0.9rem',
              border: 'none',
              backgroundColor: viewMode === 'list' ? '#3b82f6' : 'white',
              color: viewMode === 'list' ? 'white' : '#64748b',
              borderRadius: 0,
            }}
            title="列表视图"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* 日期筛选面板 */}
      {expanded && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>起始日期</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>结束日期</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  padding: '0.4rem 0.6rem',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              onClick={handleApply}
              className="btn btn-primary"
              style={{
                marginTop: 'auto',
                padding: '0.4rem 1rem',
                fontSize: '0.9rem',
              }}
            >
              应用
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogFilters;
