import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, mimeType } = req.body;

  if (!imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'Missing imageBase64 or mimeType in request body' });
  }

  const ollamaApiKey = process.env.OLLAMA_API_KEY;
  if (!ollamaApiKey) {
    return res.status(500).json({ error: 'OLLAMA_API_KEY is not configured on the server' });
  }

  const prompt = `Analyze this dashboard screenshot.
1. Extract the total number of views.
2. Extract the daily data points from the chart (date and views). Estimate the values if they are not explicitly written.
Return ONLY a valid JSON object with this exact structure:
{
  "totalViews": 123456,
  "dailyData": [
    { "date": "Feb 10", "views": 5000 },
    { "date": "Feb 11", "views": 15000 }
  ]
}
Do not include markdown formatting like \`\`\`json.`;

  try {
    const ollamaRes = await fetch('https://api.ollama.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ollamaApiKey}`,
      },
      body: JSON.stringify({
        model: 'kimi-k2.5:cloud',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${imageBase64}` },
              },
              { type: 'text', text: prompt },
            ],
          },
        ],
      }),
    });

    if (!ollamaRes.ok) {
      const errorText = await ollamaRes.text();
      console.error('Ollama API error:', ollamaRes.status, errorText);
      return res.status(ollamaRes.status).json({ error: `Ollama API error: ${ollamaRes.status}`, details: errorText });
    }

    const data = await ollamaRes.json();
    const rawText = data.choices?.[0]?.message?.content || '{}';
    const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Server error while calling Ollama:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
