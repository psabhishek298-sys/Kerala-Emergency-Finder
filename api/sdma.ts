import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

const KSDMA_URL = "https://sdma.kerala.gov.in/";
const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

async function fetchWithTimeoutAndRetry(url: string, retries: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (retries > 0 && response.status >= 500) {
        console.warn(`KSDMA returned ${response.status}, retrying...`);
        return fetchWithTimeoutAndRetry(url, retries - 1);
      }
      throw new Error(`KSDMA request failed with status ${response.status}`);
    }

    return await response.text();
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (retries > 0) {
      console.warn(`KSDMA request failed (${error.name}), retrying...`);
      return fetchWithTimeoutAndRetry(url, retries - 1);
    }
    
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const html = await fetchWithTimeoutAndRetry(KSDMA_URL, MAX_RETRIES);
    
    const $ = cheerio.load(html);
    const blockedTitles = new Set([
      "Home",
      "About KSDMA",
      "Governance",
      "Preparedness",
      "Mitigation",
      "Capacity Building",
      "Response",
      "Publications",
    ]);

    const candidates: any[] = [];
    
    $("a").each((_, element) => {
      const anchor = $(element);
      const title = anchor.text().replace(/\s+/g, " ").trim() || "";
      let href = anchor.attr("href") || KSDMA_URL;
      
      const container = anchor.closest("li, article, div, section");
      const description = container.text().replace(/\s+/g, " ").trim() || "";
      
      const looksRelevant = /warning|alert|flood|lightning|temperature|highwave|fisherman|rain|wind|ന്യൂനമർദം|ഇടിമിന്നൽ|ജാഗ്രത/i.test(
        `${title} ${description} ${href}`
      );

      if (
        looksRelevant &&
        title.length > 2 &&
        !blockedTitles.has(title) &&
        href.startsWith("https://sdma.kerala.gov.in")
      ) {
        candidates.push({
          description: description.replace(title, "").trim(),
          link: href,
          title,
        });
      }
    });

    const unique = new Map<string, any>();
    
    for (const candidate of candidates) {
      if (!unique.has(candidate.title)) {
        unique.set(candidate.title, {
          description: candidate.description || "Open the official KSDMA page for the latest details.",
          link: candidate.link,
          title: candidate.title,
        });
      }
    }

    const alerts = Array.from(unique.values()).slice(0, 6);
    
    return res.status(200).json(alerts);
  } catch (error: any) {
    console.error("SDMA API Route Error:", error);
    
    if (error.name === "AbortError") {
      return res.status(504).json({ error: "KSDMA API request timed out" });
    }
    
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
