import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Upstash integration explicitly sets UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
    // Or sometimes explicitly prefixed by the db name. Let's ensure we try them all.
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || Object.values(process.env).find(v => typeof v === 'string' && v.includes('upstash.io'));
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || Object.values(process.env).find(v => typeof v === 'string' && v.length > 50 && !v.includes('upstash.io') && !v.includes('http'));

    if (!url || !token || typeof url !== 'string' || typeof token !== 'string') {
      console.error('Database connection keys are missing in Vercel settings.');
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
