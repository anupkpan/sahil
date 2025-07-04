import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { OpenAI } from "openai";
import { scrapeShayarisFromBlog } from "./src/eknazariyaScraper";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let cachedShayaris: {
  text: string;
  mood?: string;
  theme?: string;
}[] = [];

console.log("🔄 Preloading Shayari from eknazariya...");
(async () => {
  try {
    cachedShayaris = await scrapeShayarisFromBlog();
    console.log(`✅ Cached ${cachedShayaris.length} Shayaris from blog.`);
  } catch (err) {
    console.error("❌ Failed to preload shayaris:", err);
  }
})();

app.post("/api/generate", async (req, res) => {
  const { mood, theme, depth } = req.body;
  console.log(`📩 API called with mood: ${mood}, theme: ${theme}, depth: ${depth}`);

  // Scrape on-demand if cache is empty (Vercel-safe)
  if (cachedShayaris.length === 0) {
    console.log("⏳ Scraping shayaris on first request...");
    try {
      cachedShayaris = await scrapeShayarisFromBlog();
      console.log(`✅ Scraped and cached ${cachedShayaris.length} shayaris`);
    } catch (e) {
      console.error("❌ Scraper failed:", e);
    }
  }

  // Try to match from cache
  const match = cachedShayaris.find(
    (s) =>
      (s.mood || "").includes(mood) &&
      (s.theme || "").includes(theme)
  );

  if (match) {
    console.log("📦 Matched from cache (mood + theme)");
    return res.json({ response: match.text, source: "eknazariya" });
  }

  // Fallback to OpenAI
  const prompt = `एक ${mood || "भावुक"} और ${theme || "प्रेम"} विषय पर आधारित ${
    depth > 7 ? "गहरी" : "सरल"
  } हिंदी शायरी बताओ।`;

  try {
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "तुम एक भावुक उर्दू-हिंदी शायर हो। केवल शायरी दो।" },
        { role: "user", content: prompt },
      ],
    });

    const text = result.choices[0].message.content || "";

    return res.json({
      response: text.trim(),
      source: "openai",
    });
  } catch (err: any) {
    console.error("❌ OpenAI error:", err.message);
    return res.status(500).json({ error: "OpenAI failed", response: "", source: "none" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server ready at http://localhost:${port}`);
});
