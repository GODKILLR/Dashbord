import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    const redis = new Redis({ url, token });
    
    // Save the entire body as the settings object
    await redis.set('dashboard_settings', req.body);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error saving to Redis:', err);
    return res.status(500).json({ error: 'Failed to save settings' });
  }
}
