import { OpenAI } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import type { Shayari } from "./src/types";
import dotenv from "dotenv";

dotenv.config();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

let cachedShayaris: Shayari[] = [];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { mood = "", theme = "", depth = 5 } = req.body;
  console.log("📩 API Request received:", { mood, theme, depth });

  if (cachedShayaris.length === 0) {
    try {
      const { loadCachedShayaris } = await import("./eknazariyaScraper");
      cachedShayaris = await loadCachedShayaris();
      console.log(`✅ Cached ${cachedShayaris.length} shayaris`);
    } catch (err) {
      console.error("❌ Failed to load cached shayaris", err);
    }
  }

  const filtered = cachedShayaris.filter(
    (s) =>
      s.mood.toLowerCase().includes(mood.toLowerCase()) &&
      s.theme.toLowerCase().includes(theme.toLowerCase())
  );

  if (filtered.length > 0) {
    const selected = filtered.slice(0, 6).map((s) => s.line);
    console.log("📦 Returning cached shayaris:", selected);
    return res.status(200).json({ lines: selected, source: "eknazariya" });
  }

  // OpenAI fallback
  const prompt = `एक ${mood || "भावुक"} और ${theme || "प्रेम"} विषय पर आधारित ${
    depth > 7 ? "गहरी" : "सरल"
  } हिंदी शायरी बताओ।`;

  try {
    console.log("🧠 Calling OpenAI with:", prompt);
    const result = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "तुम एक भावुक उर्दू-हिंदी शायर हो। केवल शायरी दो।" },
        { role: "user", content: prompt },
      ],
    });

    const text = result.choices[0]?.message?.content ?? "";
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    console.log("✅ OpenAI response:", lines);
    return res.status(200).json({ lines, source: "openai" });
  } catch (error: any) {
    console.error("❌ OpenAI failed:", error);
    return res.status(500).json({
      error: "OpenAI failed to generate shayari.",
      details: error?.message ?? "Unknown error",
    });
  }
}
