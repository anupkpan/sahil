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

  // Cold start load cache
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

  const normalize = (str: string) => str?.toLowerCase()?.trim();

  // Match logic — supports both string or { lines } or { mood, theme, lines }
  const matches = shayariCache.filter((entry) => {
    let text = "";

    if (typeof entry === "string") {
      text = entry;
    } else if (Array.isArray(entry.lines)) {
      text = entry.lines.join(" ");
    } else if (typeof entry.lines === "string") {
      text = entry.lines;
    }

    return normalize(text).includes(normalize(mood)) &&
           normalize(text).includes(normalize(theme));
  });

  console.log("🔍 Matching for:", mood, theme);
  console.log("📦 Total cached:", shayariCache.length);
  console.log("🔎 Matched from cache:", matches.length);

  if (matches.length > 0) {
    const match = matches[Math.floor(Math.random() * matches.length)];
    const lines = Array.isArray(match.lines)
      ? match.lines
      : typeof match === "string"
      ? match.split("\n").map((line) => line.trim()).filter(Boolean)
      : [];

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
