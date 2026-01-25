import { useState } from 'react';
import { likeBlog, unlikeBlog } from '../api/likes';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Props {
  blogId: number;
  isLiked: boolean;
  likesCount: number;
  onToggle?: (newState: { isLiked: boolean; likesCount: number }) => void;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

function LikeButton({ blogId, isLiked, likesCount, onToggle, showLabel = true, size = 'md' }: Props) {
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

  const iconSize = size === 'sm' ? '16px' : '20px';
  const fontSize = size === 'sm' ? '0.85rem' : '0.95rem';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="btn"
      style={{
        padding: size === 'sm' ? '0.4rem 0.8rem' : '0.5rem 1rem',
        fontSize,
        backgroundColor: localLiked ? '#fee2e2' : 'transparent',
        color: localLiked ? '#dc2626' : '#475569',
        border: localLiked ? '1px solid #fecaca' : '1px solid #e2e8f0',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
      }}
    >
      <span style={{ fontSize: iconSize }}>👍</span>
      {showLabel && (
        <span>
          {localLiked ? '已赞' : '点赞'}
          {localCount > 0 && ` (${localCount})`}
        </span>
      )}
    </button>
  );
}

export default LikeButton;
