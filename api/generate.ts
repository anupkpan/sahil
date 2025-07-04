import type { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";
import { loadCachedShayaris } from "../eknazariyaScraper";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let shayariCache: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Only POST requests are allowed." });
    }

    const { mood = "", theme = "", depth = 5 } = req.body || {};

    // Cold start safe cache load
    if (shayariCache.length === 0) {
      console.log("🔄 Preloading Shayari from blog...");
      shayariCache = await loadCachedShayaris();
      console.log(`✅ Cached ${shayariCache.length} Shayaris`);
    }

    // Try matching from blog cache
    const matches = shayariCache.filter(
      (s) =>
        s.mood.toLowerCase().includes(mood.toLowerCase()) &&
        s.theme.toLowerCase().includes(theme.toLowerCase())
    );

    if (matches.length > 0) {
      const match = matches[Math.floor(Math.random() * matches.length)];
      return res.status(200).json({ lines: match.lines, source: "eknazariya.com" });
    }

    // Fallback to OpenAI
    const prompt = `एक ${mood || "भावुक"} और ${theme || "प्रेम"} विषय पर आधारित ${
      depth > 7 ? "गहरी" : "सरल"
    } हिंदी शायरी बताओ।`;

    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "तुम एक भावुक उर्दू-हिंदी शायर हो। केवल शायरी दो।" },
        { role: "user", content: prompt },
      ],
    });

    const content = result.choices?.[0]?.message?.content || "";
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    return res.status(200).json({ lines, source: "OpenAI" });
  } catch (err: any) {
    console.error("❌ API Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
