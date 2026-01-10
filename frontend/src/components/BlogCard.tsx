import { Link } from 'react-router-dom';
import type { Blog } from '../types/blog';

interface Props {
  blog: Blog;
}

function BlogCard({ blog }: Props) {
  return (
    <article className="card" style={{ cursor: 'pointer' }}>
      <Link to={`/blogs/${blog.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <h3>{blog.title}</h3>
        <p className="small-muted">
          {blog.author} · {new Date(blog.created_at).toLocaleDateString()} · {blog.views} 次阅读
        </p>
        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
          {blog.excerpt}
        </p>
      </Link>
    </article>
  );
}

export default BlogCard;
