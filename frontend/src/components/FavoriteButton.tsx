import { useState } from 'react';
import { favoriteBlog, unfavoriteBlog, getFavoriteFolders, createFavoriteFolder } from '../api/favorites';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { FavoriteFolder } from '../types/favorite';
import { formatNumber } from '../utils/formatNumber';

interface Props {
  blogId: number;
  isFavorited: boolean;
  favoritesCount: number;
  onToggle?: (newState: { isFavorited: boolean; favoritesCount: number }) => void;
  size?: 'sm' | 'md';
}

function FavoriteButton({
  blogId,
  isFavorited,
  favoritesCount,
  onToggle,
  size = 'md'
}: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [localFavorited, setLocalFavorited] = useState(isFavorited);
  const [localCount, setLocalCount] = useState(favoritesCount);
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [folders, setFolders] = useState<FavoriteFolder[]>([]);

  const handleToggle = async (folderId?: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (loading) return;

    // 如果已收藏且没有指定文件夹，显示取消确认
    if (localFavorited && !folderId) {
      const confirmed = window.confirm('确定要取消收藏吗？');
      if (!confirmed) return;
    }

    setLoading(true);
    const previousState = { isFavorited: localFavorited, favoritesCount: localCount };

    try {
      // 如果要收藏，先获取文件夹列表
      if (!localFavorited && !folderId) {
        const data = await getFavoriteFolders();
        if (data.folders.length === 0) {
          // 如果没有文件夹，创建默认文件夹
          try {
            const newFolder = await createFavoriteFolder({ name: '我的收藏', is_public: true });
            folderId = newFolder.id;
          } catch (error) {
            console.error('创建文件夹失败:', error);
            setLocalFavorited(previousState.isFavorited);
            setLocalCount(previousState.favoritesCount);
            onToggle?.(previousState);
            setLoading(false);
            return;
          }
        } else {
          setFolders(data.folders);
          setShowFolderMenu(true);
          setLoading(false);
          return;
        }
      }

      // 乐观更新
      const newState = {
        isFavorited: !localFavorited,
        favoritesCount: localFavorited ? localCount - 1 : localCount + 1
      };

      setLocalFavorited(newState.isFavorited);
      setLocalCount(newState.favoritesCount);
      onToggle?.(newState);

      // 调用 API
      if (localFavorited) {
        await unfavoriteBlog(blogId, folderId ? { folder_id: folderId } : undefined);
      } else {
        await favoriteBlog(blogId, { folder_id: folderId! });
      }

      setShowFolderMenu(false);
    } catch (error) {
      console.error('收藏操作失败:', error);
      setLocalFavorited(previousState.isFavorited);
      setLocalCount(previousState.favoritesCount);
      onToggle?.(previousState);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? '18px' : '20px';
  const fontSize = size === 'sm' ? '0.85rem' : '0.95rem';

  // SVG 五角星图标
  const StarIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill={localFavorited ? '#fbbf24' : 'none'}
      stroke={localFavorited ? '#fbbf24' : '#94a3b8'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => handleToggle()}
        disabled={loading}
        className="btn"
        style={{
          padding: size === 'sm' ? '0.4rem' : '0.5rem',
          fontSize,
          backgroundColor: 'transparent',
          border: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.3rem',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.6 : 1,
          width: '4.5rem',
        }}
      >
        <StarIcon />
        <span
          style={{
            color: localFavorited ? '#d97706' : '#94a3b8',
            fontFamily: localCount > 0 ? 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace' : 'inherit',
            fontSize: '0.9rem',
            fontWeight: localFavorited ? '600' : '400',
            flex: 1,
            textAlign: 'left',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {localCount > 0 ? formatNumber(localCount) : '收藏'}
        </span>
      </button>

      {/* 文件夹选择菜单 */}
      {showFolderMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '0.5rem',
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '200px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #e2e8f0',
              fontWeight: 500,
            }}
          >
            选择收藏文件夹
          </div>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => handleToggle(folder.id)}
              className="btn"
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                textAlign: 'left',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              📁 {folder.name} ({folder.favorites_count})
            </button>
          ))}
          <button
            onClick={() => {
              setShowFolderMenu(false);
              navigate('/favorites/folders');
            }}
            className="btn"
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              textAlign: 'left',
              border: 'none',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              color: '#3b82f6',
            }}
          >
            + 管理文件夹
          </button>
        </div>
      )}
    </div>
  );
}

export default FavoriteButton;
