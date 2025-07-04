// test-scraper.ts
import fetch from "node-fetch";
import * as cheerio from "cheerio";

async function scrapeShayarisFromPage(url: string) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);

  let rawText = "";

  // Prefer elementor-widget-container if available
  const containers = $(".elementor-widget-container");

  if (containers.length > 0) {
    containers.each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) {
        rawText += text + "\n\n";
      }
    });
  } else {
    console.warn("⚠️ '.elementor-widget-container' not found. Falling back to <div>s.");
    $("div").each((_, el) => {
      const text = $(el).text().trim();
      if (text.includes("!!")) {
        rawText += text + "\n\n";
      }
    });
  }

  // Split by the divider or newlines
  const rawShayaris = rawText
    .split(/[-]{10,}|[\r\n]{2,}/) // match long dashed lines or blank lines
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.includes("..") || s.includes("!!"));

  console.log("✅ Cleaned Shayaris:\n");
  rawShayaris.slice(0, 10).forEach((s, i) => {
    console.log(`--- Shayari ${i + 1} ---\n${s}\n`);
  });
}

scrapeShayarisFromPage("https://eknazariya.com/ishq-shayari").catch(console.error);
