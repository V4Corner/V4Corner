import { useEffect, useState } from 'react';
import { getBlogs } from '../api/client';
import BlogCard from '../components/BlogCard';
import { Blog } from '../types/blog';

function Blogs() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBlogs()
      .then((data) => setBlogs(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading blogs...</p>;
  if (error) return <p className="small-muted">{error}</p>;

  return (
    <section>
      <h1>Blogs</h1>
      <p className="small-muted">Posts from classmates. Connect the backend at /api/blogs.</p>
      <div className="card-grid">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
        {blogs.length === 0 && <p>No blogs yet. Add one through the API.</p>}
      </div>
    </section>
  );
}

export default Blogs;
