// src/eknazariyaScraper.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ShayariItem {
  text: string;
  source: string;
}

export async function fetchIshqShayaris(): Promise<ShayariItem[]> {
  const url = 'https://eknazariya.com/ishq-shayari';
  const result: ShayariItem[] = [];

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $('.elementor-widget-container').each((i, el) => {
      const text = $(el).text().trim();
      if (text.length >= 30) {
        result.push({ text, source: 'eknazariya' });
      }
    });
  } catch (err) {
    console.error('Failed to scrape eknazariya:', err);
  }

  return result;
}
