import { OpenAI } from "openai";
import type { IncomingMessage, ServerResponse } from "http";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse & { status: any; json: any }) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST requests allowed" });
    return;
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk;
  });

  req.on("end", async () => {
    try {
      const parsed = JSON.parse(body);
      const { mood, theme, depth } = parsed;

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

      const text = result.choices[0].message.content || "";
      const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      res.status(200).json({ lines });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to generate shayari." });
    }
  });
}
