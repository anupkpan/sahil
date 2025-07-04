import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { OpenAI } from "openai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// 1. Blog URLs to preload
const sourceUrls: string[] = [
  "https://eknazariya.com/",
  "https://eknazariya.com/ishq-shayari",
  "https://eknazariya.com/shayari-sangrah",
  "https://eknazariya.com/virah-shayari-1",
  "https://eknazariya.com/ghalib-shayari",
  "https://eknazariya.com/bashir-badr-shayari-1",
  "https://eknazariya.com/gulzar-shayari-1",
  "https://eknazariya.com/waseem-barelvi-1",
  "https://eknazariya.com/ahmad-faraz-1",
  "https://eknazariya.com/javed-akhtar",
  "https://eknazariya.com/nida-fazli-1",
  "https://eknazariya.com/rahat-indori-4",
  "https://eknazariya.com/rahat-indori",
  "https://eknazariya.com/jaun-eliya",
  "https://eknazariya.com/tahzeeb-hafi"
];

let cachedShayaris: string[] = [];

// 2. Extract Shayari blocks (3–10+ lines)
function extractShayariBlocks(rawText: string): string[] {
  return rawText
    .split(/[-]{5,}|\n{2,}|\r\n{2,}/)
    .map((s) => s.trim())
    .filter((s) => s.split("\n").length >= 3 && s.length >= 40);
}

// 3. Scraper logic for each page
async function scrapeShayarisFromUrl(url: string): Promise<string[]> {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    let rawText = "";
    const containers = $(".elementor-widget-container");

    if (containers.length > 0) {
      containers.each((_, el) => {
        const text = $(el).text().trim();
        if (text.length >= 30) rawText += text + "\n\n";
      });
    } else {
      $("div").each((_, el) => {
        const text = $(el).text().trim();
        if (text.includes("!!")) rawText += text + "\n\n";
      });
    }

    const blocks = extractShayariBlocks(rawText);
    console.log(`🔍 Scraped ${blocks.length} Shayaris from: ${url}`);
    return blocks;
  } catch (err) {
    console.error(`❌ Error scraping ${url}:`, err);
    return [];
  }
}

// 4. Preload all blogs on server start
(async () => {
  console.log("🔄 Preloading Shayari from eknazariya...");
  const all = await Promise.all(sourceUrls.map(scrapeShayarisFromUrl));
  cachedShayaris = all.flat();
  console.log(`✅ Cached ${cachedShayaris.length} Shayaris from blog.`);
})();

// 5. Live fallback scraper
async function searchEknazariyaLive(mood: string, theme: string): Promise<string | null> {
  const query = `${mood} ${theme}`.trim();
  const url = `https://eknazariya.com/?s=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);
    const firstLink = $(".entry-title a").first().attr("href");

    if (firstLink) {
      const postRes = await fetch(firstLink);
      const postHtml = await postRes.text();
      const $$ = cheerio.load(postHtml);
      const text = $$("blockquote").first().text().trim() || $$("p").first().text().trim();
      if (text.length >= 30) return text;
    }
  } catch (e) {
    console.error("❌ Live scrape failed:", e);
  }
  return null;
}

// 6. API handler
app.post("/api/generate", async (req, res) => {
  const { mood, theme, depth } = req.body;
  console.log(`📩 API called with mood: ${mood}, theme: ${theme}, depth: ${depth}`);

  try {
    const bothMatch = cachedShayaris.find(
      (s) => s.includes(mood) && s.includes(theme)
    );
    if (bothMatch) {
      console.log("📦 Matched from cache (mood + theme)");
      return res.json({ response: bothMatch, source: "eknazariya" });
    }

    const liveResult = await searchEknazariyaLive(mood, theme);
    if (liveResult) {
      console.log("🔍 Found via live scrape");
      return res.json({ response: liveResult, source: "eknazariya" });
    }

    const messages = [
      { role: "system", content: "You are a poetic Hindi Shayari writer." },
      { role: "user", content: `Write a Shayari about ${mood} and ${theme} with depth ${depth}/10.` }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.9
    });

    const output = completion.choices[0]?.message.content;
    console.log("🧠 Served via OpenAI");
    res.json({ response: output, source: "openai" });
  } catch (err) {
    console.error("❌ Generation error:", err);
    res.status(500).json({ error: "शायरी बनाने में समस्या हुई।" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
