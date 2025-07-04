import * as cheerio from "cheerio";
import fetch from "node-fetch";

const urls = [
  "https://eknazariya.com/ishq-shayari",
  "https://eknazariya.com/",
  "https://eknazariya.com/ghalib-shayari",
  "https://eknazariya.com/bashir-badr-shayari-1",
  "https://eknazariya.com/javed-akhtar",
  "https://eknazariya.com/rahat-indori",
  "https://eknazariya.com/nida-fazli-1",
  "https://eknazariya.com/ahmad-faraz-1",
  "https://eknazariya.com/waseem-barelvi-1",
  "https://eknazariya.com/jaun-eliya",
  "https://eknazariya.com/tahzeeb-hafi",
  "https://eknazariya.com/gulzar-shayari-1",
  "https://eknazariya.com/rahat-indori-4",
  "https://eknazariya.com/shayari-sangrah",
  "https://eknazariya.com/virah-shayari-1"
];

export async function loadCachedShayaris() {
  const allShayaris: any[] = [];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      const html = await res.text();
      const $ = cheerio.load(html);

      $("p").each((_, el) => {
        const text = $(el).text().trim();
        const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length >= 2) {
          allShayaris.push({
            mood: detectMood(url),
            theme: detectTheme(url),
            lines,
          });
        }
      });

      console.log(`🔍 Scraped ${allShayaris.length} Shayaris from: ${url}`);
    } catch (e) {
      console.warn(`⚠️ Failed to scrape ${url}`);
    }
  }

  return allShayaris;
}

function detectMood(url: string): string {
  if (url.includes("ghalib")) return "ग़ालिब";
  if (url.includes("gulzar")) return "गुलज़ार";
  if (url.includes("rahat")) return "राहत इंदोरी";
  if (url.includes("javed")) return "जावेद अख़्तर";
  if (url.includes("bashir")) return "बशीर बद्र";
  if (url.includes("jaun")) return "जौन एलिया";
  return "अन्य";
}

function detectTheme(url: string): string {
  if (url.includes("virah")) return "विरह";
  if (url.includes("ishq") || url.includes("ishq-shayari")) return "इश्क़";
  if (url.includes("tanhai")) return "तन्हाई";
  if (url.includes("mohabbat")) return "मोहब्बत";
  if (url.includes("dard")) return "दर्द";
  return "अन्य";
}
