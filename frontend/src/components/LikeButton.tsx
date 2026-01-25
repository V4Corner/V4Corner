import { useState } from 'react';
import { likeBlog, unlikeBlog } from '../api/likes';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatNumber } from '../utils/formatNumber';

interface Props {
  blogId: number;
  isLiked: boolean;
  likesCount: number;
  onToggle?: (newState: { isLiked: boolean; likesCount: number }) => void;
  size?: 'sm' | 'md';
}

function LikeButton({ blogId, isLiked, likesCount, onToggle, size = 'md' }: Props) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localCount, setLocalCount] = useState(likesCount);

  const handleClick = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (loading) return;

    setLoading(true);
    const previousState = { isLiked: localLiked, likesCount: localCount };

    try {
      // 乐观更新
      const newState = {
        isLiked: !localLiked,
        likesCount: localLiked ? localCount - 1 : localCount + 1
      };

      setLocalLiked(newState.isLiked);
      setLocalCount(newState.likesCount);
      onToggle?.(newState);

      // 调用 API
      if (localLiked) {
        await unlikeBlog(blogId);
      } else {
        await likeBlog(blogId);
      }
    } catch (error) {
      // 失败回滚
      console.error('点赞操作失败:', error);
      setLocalLiked(previousState.isLiked);
      setLocalCount(previousState.likesCount);
      onToggle?.(previousState);
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'sm' ? '18px' : '20px';
  const fontSize = size === 'sm' ? '0.85rem' : '0.95rem';

  // SVG 爱心图标
  const HeartIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 24 24"
      fill={localLiked ? '#ef4444' : 'none'}
      stroke={localLiked ? '#ef4444' : '#94a3b8'}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0 }}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
    </svg>
  );

  return (
    <button
      onClick={handleClick}
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
      <HeartIcon />
      <span
        style={{
          color: localLiked ? '#dc2626' : '#94a3b8',
          fontFamily: localCount > 0 ? 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace' : 'inherit',
          fontSize: '0.9rem',
          fontWeight: localLiked ? '600' : '400',
          flex: 1,
          textAlign: 'left',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {localCount > 0 ? formatNumber(localCount) : '点赞'}
      </span>
    </button>
  );
}

export default LikeButton;
