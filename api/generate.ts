import { VercelRequest, VercelResponse } from "@vercel/node";
import { OpenAI } from "openai";
import { loadCachedShayaris } from "./lib/eknazariyaScraper.js"; // <- .js important!

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
let shayariCache: any[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { mood = "", theme = "", depth = 5 } = req.body;

  try {
    if (shayariCache.length === 0) {
      console.log("🔄 Preloading shayari from eknazariya...");
      shayariCache = await loadCachedShayaris();
      console.log(`✅ Cached ${shayariCache.length} shayaris`);
    }

    const matches = shayariCache.filter(
      (s) => s.mood?.includes(mood) && s.theme?.includes(theme)
    );

    if (matches.length > 0) {
      const selected = matches[Math.floor(Math.random() * matches.length)];
      return res.status(200).json({
        lines: selected.lines,
        source: "eknazariya.com"
      });
    }

    // fallback to OpenAI
    const prompt = `एक ${mood || "भावुक"} और ${theme || "प्रेम"} विषय पर आधारित ${depth > 7 ? "गहरी" : "सरल"} हिंदी शायरी बताओ।`;

    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "तुम एक भावुक उर्दू-हिंदी शायर हो। केवल शायरी दो।" },
        { role: "user", content: prompt }
      ]
    });

    const text = result.choices[0]?.message?.content || "";
    const lines = text.split("\n").map(line => line.trim()).filter(Boolean);

    return res.status(200).json({ lines, source: "OpenAI" });
  } catch (err: any) {
    console.error("❌ Error in handler", err);
    return res.status(500).json({ error: err.message || "Failed to generate shayari." });
  }
}
