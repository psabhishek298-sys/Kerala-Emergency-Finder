import type { VercelRequest, VercelResponse } from "@vercel/node";

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;

async function fetchWithTimeoutAndRetry(url: string, body: string, retries: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        "User-Agent": "KeralaEmergencyFinder/1.0",
      },
      body,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (retries > 0 && response.status >= 500) {
        console.warn(`Overpass returned ${response.status}, retrying...`);
        return fetchWithTimeoutAndRetry(url, body, retries - 1);
      }
      throw new Error(`Overpass request failed with status ${response.status}`);
    }

    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (retries > 0) {
      console.warn(`Overpass request failed (${error.name}), retrying...`);
      return fetchWithTimeoutAndRetry(url, body, retries - 1);
    }
    
    throw error;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let query = req.body?.data;
    if (!query && typeof req.body === "string") {
      const params = new URLSearchParams(req.body);
      query = params.get("data");
    }

    if (!query) {
      return res.status(400).json({ error: "Missing 'data' query parameter in request body" });
    }

    const bodyParams = new URLSearchParams({ data: query }).toString();
    
    // Try primary endpoint, then fallback if needed
    let response: Response | null = null;
    let lastError: Error | null = null;
    
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        response = await fetchWithTimeoutAndRetry(endpoint, bodyParams, MAX_RETRIES);
        break; // Success
      } catch (error: any) {
        lastError = error;
      }
    }

    if (!response) {
      throw lastError || new Error("All Overpass endpoints failed");
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error("Overpass API Route Error:", error);
    
    if (error.name === "AbortError") {
      return res.status(504).json({ error: "Overpass API request timed out" });
    }
    
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
}
