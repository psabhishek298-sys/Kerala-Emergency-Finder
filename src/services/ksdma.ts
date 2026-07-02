import { fetchText } from "@/lib/fetcher";
import type { DisasterAlert } from "@/types";

const KSDMA_URL = "https://sdma.kerala.gov.in/";
const FALLBACK_PROXY = "https://api.allorigins.win/raw?url=";

export async function fetchKeralaDisasterAlerts(): Promise<DisasterAlert[]> {
  try {
    const html = await fetchText(KSDMA_URL);
    return parseAlertsFromHtml(html);
  } catch {
    const proxiedHtml = await fetchText(`${FALLBACK_PROXY}${encodeURIComponent(KSDMA_URL)}`);
    return parseAlertsFromHtml(proxiedHtml);
  }
}

function parseAlertsFromHtml(html: string): DisasterAlert[] {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");
  const anchors = Array.from(document.querySelectorAll<HTMLAnchorElement>("a"));
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

  const candidates = anchors
    .map((anchor) => {
      const title = anchor.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const href = anchor.href || KSDMA_URL;
      const container = anchor.closest("li, article, div, section");
      const description = container?.textContent?.replace(/\s+/g, " ").trim() ?? "";
      const looksRelevant =
        /warning|alert|flood|lightning|temperature|highwave|fisherman|rain|wind|ന്യൂനമർദം|ഇടിമിന്നൽ|ജാഗ്രത/i.test(
          `${title} ${description} ${href}`,
        );

      return {
        description: description.replace(title, "").trim(),
        link: href,
        looksRelevant,
        title,
      };
    })
    .filter(
      (item) =>
        item.looksRelevant &&
        item.title.length > 2 &&
        !blockedTitles.has(item.title) &&
        item.link.startsWith("https://sdma.kerala.gov.in"),
    );

  const unique = new Map<string, DisasterAlert>();

  for (const candidate of candidates) {
    if (!unique.has(candidate.title)) {
      unique.set(candidate.title, {
        description:
          candidate.description || "Open the official KSDMA page for the latest details.",
        link: candidate.link,
        title: candidate.title,
      });
    }
  }

  return Array.from(unique.values()).slice(0, 6);
}
