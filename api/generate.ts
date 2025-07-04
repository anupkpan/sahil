import { OpenAI } from "openai";
import type { VercelRequest, VercelResponse } from "@vercel/node";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { mood, theme, depth } = req.body;

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

    return res.status(200).json({ lines });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Failed to generate shayari." });
  }
}
