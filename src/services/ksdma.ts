import { fetchJson } from "@/lib/fetcher";
import type { DisasterAlert } from "@/types";

export async function fetchKeralaDisasterAlerts(): Promise<DisasterAlert[]> {
  try {
    return await fetchJson<DisasterAlert[]>("/api/sdma");
  } catch (error) {
    console.error("Failed to fetch disaster alerts from backend:", error);
    return [];
  }
}
