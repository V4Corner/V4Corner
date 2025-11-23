import { Blog } from '../types/blog';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

// Simple wrapper around fetch to keep calls consistent.
export async function getBlogs(): Promise<Blog[]> {
  const response = await fetch(`${API_BASE}/api/blogs`);
  if (!response.ok) {
    throw new Error('Failed to load blogs');
  }
  return response.json();
}
