import { VercelRequest, VercelResponse } from '@vercel/node';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let cachedShayaris: { text: string; mood?: string; theme?: string }[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { mood, theme, depth } = req.body;

  // ⏳ Scrape only if cache is empty
  if (cachedShayaris.length === 0) {
    console.log('⏳ Running scraper inside handler...');
    const { scrapeShayarisFromBlog } = await import('../src/eknazariyaScraper');
    try {
      cachedShayaris = await scrapeShayarisFromBlog();
      console.log(`✅ Scraped ${cachedShayaris.length} shayaris`);
    } catch (err) {
      console.error('❌ Scraping failed:', err);
    }
  }

  const match = cachedShayaris.find(
    (s) =>
      (s.mood || '').includes(mood) &&
      (s.theme || '').includes(theme)
  );

  if (match) {
    console.log(`📦 Returning shayari from cache`);
    return res.status(200).json({ response: match.text, source: 'eknazariya' });
  }

  const prompt = `एक ${mood || 'भावुक'} और ${theme || 'प्रेम'} विषय पर आधारित ${
    depth > 7 ? 'गहरी' : 'सरल'
  } हिंदी शायरी बताओ।`;

  try {
    const result = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'तुम एक भावुक उर्दू-हिंदी शायर हो। केवल शायरी दो।' },
        { role: 'user', content: prompt },
      ],
    });

    const text = result.choices[0].message.content || '';

    return res.status(200).json({
      response: text.trim(),
      source: 'openai',
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'OpenAI error', source: 'none' });
  }
}
