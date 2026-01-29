import { apiRequest } from './client';

export async function getMediaSizes(urls: string[]): Promise<Record<string, number>> {
  const response = await apiRequest<{ sizes: Record<string, number> }>('/api/uploads/media/sizes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ urls }),
  });
  return response.sizes;
}
