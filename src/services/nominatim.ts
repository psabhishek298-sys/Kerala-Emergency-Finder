import { KERALA_VIEWBOX } from "@/lib/constants";
import { fetchJson } from "@/lib/fetcher";
import type { SearchLocation } from "@/types";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  type: string;
};

export async function searchKeralaLocations(
  queryText: string,
): Promise<SearchLocation[]> {
  const params = new URLSearchParams({
    q: `${queryText}, Kerala, India`,
    format: "jsonv2",
    limit: "8",
    bounded: "1",
    viewbox: `${KERALA_VIEWBOX.left},${KERALA_VIEWBOX.top},${KERALA_VIEWBOX.right},${KERALA_VIEWBOX.bottom}`,
  });

  const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const data = await fetchJson<NominatimResult[]>(url, {
    headers: {
      Accept: "application/json",
    },
  });

  return data.map((item) => ({
    address: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    name: item.name ?? item.display_name.split(",")[0] ?? "Kerala result",
    type: item.type,
  }));
}
