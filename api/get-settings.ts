import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      console.error('Redis credentials missing', { url: !!url, token: !!token });
      return res.status(500).json({ error: 'Database configuration missing' });
    }

    const redis = new Redis({ url, token });
    const settings = await redis.get('dashboard_settings');

    if (!settings) {
      // Return null to let the frontend use its defaults if nothing is saved yet
      return res.status(200).json(null);
    }

    return res.status(200).json(settings);
  } catch (err) {
    console.error('Error fetching from Redis:', err);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
}
