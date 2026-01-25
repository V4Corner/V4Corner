import { Link } from 'react-router-dom';
import type { Blog } from '../types/blog';
import LikeButton from './LikeButton';
import FavoriteButton from './FavoriteButton';
import { useState, useEffect } from 'react';

interface Props {
  blog: Blog;
}

function BlogCard({ blog }: Props) {
  const [isLiked, setIsLiked] = useState(blog.is_liked);
  const [likesCount, setLikesCount] = useState(blog.likes_count);
  const [isFavorited, setIsFavorited] = useState(blog.is_favorited);
  const [favoritesCount, setFavoritesCount] = useState(blog.favorites_count);

  return (
    <article className="card" style={{ cursor: 'pointer' }}>
      <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#0f172a',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
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
          <p className="small-muted" style={{ margin: 0 }}>
            {blog.author}
          </p>
        </div>
        <h3 style={{ marginBottom: '0.5rem' }}>{blog.title}</h3>
        <p className="small-muted" style={{ marginBottom: '0.75rem' }}>
          {new Date(blog.created_at).toLocaleDateString()} · {blog.views} 次阅读
        </p>
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
          }}
        >
          {blog.excerpt}
        </p>
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
            showLabel={false}
            onToggle={(newState) => {
              setIsLiked(newState.isLiked);
              setLikesCount(newState.likesCount);
            }}
          />
          {likesCount > 0 && (
            <span className="small-muted" style={{ fontSize: '0.85rem' }}>
              {likesCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <FavoriteButton
            blogId={blog.id}
            isFavorited={isFavorited}
            favoritesCount={favoritesCount}
            size="sm"
            showLabel={false}
            onToggle={(newState) => {
              setIsFavorited(newState.isFavorited);
              setFavoritesCount(newState.favoritesCount);
            }}
          />
          {favoritesCount > 0 && (
            <span className="small-muted" style={{ fontSize: '0.85rem' }}>
              {favoritesCount}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default BlogCard;
