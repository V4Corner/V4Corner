import { Blog } from '../types/blog';

interface Props {
  blog: Blog;
}

function BlogCard({ blog }: Props) {
  return (
    <article className="card">
      <h3>{blog.title}</h3>
      <p className="small-muted">
        By {blog.author} · {new Date(blog.created_at).toLocaleDateString()}
      </p>
      <p>{blog.summary}</p>
    </article>
  );
}

export default BlogCard;
