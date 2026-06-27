import { kv } from '@vercel/kv';

export default async function handler(request, response) {
  const kvKey = 'impresionante_linkedin_progress';

  // Handle GET request - Return all progress
  if (request.method === 'GET') {
    try {
      const progress = await kv.get(kvKey) || {};
      return response.status(200).json(progress);
    } catch (error) {
      console.error('KV GET Error:', error);
      // Return empty object if KV is not configured yet, so the app doesn't break
      return response.status(200).json({});
    }
  }

  // Handle POST request - Update a specific post's progress
  if (request.method === 'POST') {
    try {
      const { aid, postId, checked } = request.body;
      
      if (!aid || postId === undefined || checked === undefined) {
        return response.status(400).json({ error: 'Missing parameters' });
      }

      // Get current progress
      let progress = await kv.get(kvKey) || {};
      
      // Initialize asesor if not exists
      if (!progress[aid]) {
        progress[aid] = {};
      }
      
      // Update specific post
      progress[aid][postId] = checked;
      
      // Save back to KV
      await kv.set(kvKey, progress);
      
      return response.status(200).json({ success: true, progress });
    } catch (error) {
      console.error('KV POST Error:', error);
      return response.status(500).json({ error: 'Database error: KV might not be configured' });
    }
  }

  return response.status(405).json({ error: 'Method not allowed' });
}
