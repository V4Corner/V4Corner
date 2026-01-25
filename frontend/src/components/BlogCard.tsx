import { Link } from 'react-router-dom';
import type { Blog, BlogListItem } from '../types/blog';
import LikeButton from './LikeButton';
import FavoriteButton from './FavoriteButton';
import { useState, useEffect } from 'react';
import { formatNumber } from '../utils/formatNumber';

interface Props {
  blog: Blog | BlogListItem;
}

function BlogCard({ blog }: Props) {
  const [isLiked, setIsLiked] = useState(blog.is_liked);
  const [likesCount, setLikesCount] = useState(blog.likes_count);
  const [isFavorited, setIsFavorited] = useState(blog.is_favorited);
  const [favoritesCount, setFavoritesCount] = useState(blog.favorites_count);

  return (
    <article className="card" style={{ cursor: 'pointer' }}>
      <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3 style={{ marginBottom: '0.5rem' }}>{blog.title}</h3>
        <p
          style={{
            color: '#475569',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'pre-line',
            minHeight: '3.2rem',  // 固定两行高度
            marginBottom: '0.75rem',
          }}
        >
          {blog.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.75rem',
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
          <p className="small-muted" style={{ margin: 0, fontSize: '0.85rem', maxWidth: '7em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {blog.author}
          </p>
          <span className="small-muted" style={{ margin: '0 0.15rem', fontSize: '0.85rem' }}>·</span>
          <p className="small-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            {new Date(blog.created_at).toLocaleDateString()}
          </p>
          <span className="small-muted" style={{ margin: '0 0.15rem', fontSize: '0.85rem' }}>·</span>
          <p className="small-muted" style={{ margin: 0, fontSize: '0.85rem' }}>
            {formatNumber(blog.views)} 次阅读
          </p>
        </div>
      </Link>

      {/* 点赞和收藏数 */}
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: '1px solid #f1f5f9',
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <LikeButton
            blogId={blog.id}
            isLiked={isLiked}
            likesCount={likesCount}
            size="sm"
            onToggle={(newState) => {
              setIsLiked(newState.isLiked);
              setLikesCount(newState.likesCount);
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <FavoriteButton
            blogId={blog.id}
            isFavorited={isFavorited}
            favoritesCount={favoritesCount}
            size="sm"
            onToggle={(newState) => {
              setIsFavorited(newState.isFavorited);
              setFavoritesCount(newState.favoritesCount);
            }}
          />
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
