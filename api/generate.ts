import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";
import { loadCachedShayaris } from "./lib/eknazariyaScraper.js"; // Use `.js` for Vercel compatibility

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let shayariCache: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { mood = "", theme = "", depth = 5 } = req.body;

  // Cold start cache
  if (shayariCache.length === 0) {
    try {
      console.log("🔄 Preloading shayari from eknazariya...");
      shayariCache = await loadCachedShayaris();
      console.log(`✅ Cached ${shayariCache.length} shayaris`);
      console.log("📦 Example cache entry:", shayariCache[0]);
    } catch (err) {
      console.error("❌ Failed to load shayari cache", err);
    }
  }

  // Tokenize input for flexible matching
  const tokens = (mood + " " + theme).toLowerCase().split(/\s+/).filter(Boolean);

  // Match against shayari content directly
  const matches = shayariCache.filter((entry) => {
    const fullText = Array.isArray(entry.lines)
      ? entry.lines.join(" ").toLowerCase()
      : typeof entry === "string"
      ? entry.toLowerCase()
      : "";

    return tokens.some((token) => fullText.includes(token));
  });

  console.log("🔍 Matching for:", mood, theme);
  console.log("📦 Total cached:", shayariCache.length);
  console.log("🔎 Matched from cache:", matches.length);

  if (matches.length > 0) {
    const lines = matches[Math.floor(Math.random() * matches.length)].lines;
    return res.status(200).json({ lines, source: "eknazariya.com" });
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
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return res.status(200).json({ lines, source: "OpenAI" });
  } catch (err: any) {
    console.error("❌ OpenAI error", err);
    return res.status(500).json({ error: err.message || "Failed to generate shayari." });
  }
}
