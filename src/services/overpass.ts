import { CATEGORY_META } from "@/lib/constants";
import { calculateDistanceKm } from "@/lib/geo";
import type {
  Coordinates,
  EmergencyCategory,
  EmergencyPlace,
} from "@/types";

type OverpassElement = {
  center?: { lat: number; lon: number };
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
  type: "node" | "relation" | "way";
};

type OverpassResponse = {
  elements: OverpassElement[];
};

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
] as const;

const OVERPASS_TIMEOUT_MS = 20_000;
const DEV_MODE = import.meta.env.DEV;

export async function fetchNearbyEmergencyPlaces(
  center: Coordinates,
  radiusKm: number,
): Promise<EmergencyPlace[]> {
  const radiusMeters = Math.max(1, Math.round(radiusKm * 1000));
  const query = `
[out:json][timeout:20];
(
  nwr(around:${radiusMeters},${center.latitude},${center.longitude})["amenity"="hospital"];
  nwr(around:${radiusMeters},${center.latitude},${center.longitude})["healthcare"="hospital"];
  nwr(around:${radiusMeters},${center.latitude},${center.longitude})["amenity"="police"];
  nwr(around:${radiusMeters},${center.latitude},${center.longitude})["amenity"="fire_station"];
  nwr(around:${radiusMeters},${center.latitude},${center.longitude})["amenity"="pharmacy"];
  nwr(around:${radiusMeters},${center.latitude},${center.longitude})["amenity"="blood_bank"];
  nwr(around:${radiusMeters},${center.latitude},${center.longitude})["healthcare"="blood_donation"];
);
out center tags;
`;

  validateOverpassQuery(query);
  const data = await requestOverpass(query);
  const places = normalizeOverpassResults(data.elements, center);
  logOverpass("Places returned", places.length);
  return places;
}

export async function searchEmergencyPlacesInKerala(
  queryText: string,
  center: Coordinates,
): Promise<EmergencyPlace[]> {
  const escaped = escapeRegex(queryText);
  const query = `
[out:json][timeout:20];
area["ISO3166-2"="IN-KL"]->.searchArea;
(
  nwr(area.searchArea)["name"~"${escaped}",i]["amenity"~"hospital|police|fire_station|pharmacy|blood_bank"];
  nwr(area.searchArea)["name"~"${escaped}",i]["healthcare"~"hospital|blood_donation"];
);
out center tags 30;
`;

  validateOverpassQuery(query);
  const data = await requestOverpass(query);
  const places = normalizeOverpassResults(data.elements, center).slice(0, 20);
  logOverpass("Places returned", places.length);
  return places;
}

function normalizeOverpassResults(
  elements: OverpassElement[],
  center: Coordinates,
) {
  return elements
    .map((element) => normalizeElement(element, center))
    .filter((place): place is EmergencyPlace => Boolean(place))
    .reduce<EmergencyPlace[]>((uniquePlaces, place) => {
      const duplicateIndex = uniquePlaces.findIndex((existingPlace) =>
        isDuplicatePlace(existingPlace, place),
      );

      if (duplicateIndex === -1) {
        uniquePlaces.push(place);
        return uniquePlaces;
      }

      uniquePlaces[duplicateIndex] = pickBetterPlace(uniquePlaces[duplicateIndex], place);
      return uniquePlaces;
    }, [])
    .sort((left, right) => left.distanceKm - right.distanceKm);
}

function normalizeElement(
  element: OverpassElement,
  center: Coordinates,
): EmergencyPlace | null {
  const latitude = element.lat ?? element.center?.lat;
  const longitude = element.lon ?? element.center?.lon;
  const tags = element.tags ?? {};

  if (latitude == null || longitude == null) {
    return null;
  }

  const category = inferCategory(tags);
  if (!category) {
    return null;
  }

  const name = tags.name ?? CATEGORY_META[category].shortLabel;
  const address = buildAddress(tags);
  const phone =
    tags.phone ?? tags["contact:phone"] ?? tags["phone_1"] ?? tags["mobile"];

  return {
    address,
    category,
    distanceKm: calculateDistanceKm(center, { latitude, longitude }),
    id: `${element.type}-${element.id}-${category}`,
    latitude,
    longitude,
    name,
    phone,
    tags,
  };
}

function inferCategory(
  tags: Record<string, string>,
): EmergencyCategory | null {
  if (tags.amenity === "hospital" || tags.healthcare === "hospital") {
    return "hospital";
  }
  if (tags.amenity === "police") {
    return "police";
  }
  if (tags.amenity === "fire_station") {
    return "fire_station";
  }
  if (tags.amenity === "pharmacy") {
    return "pharmacy";
  }
  if (tags.amenity === "blood_bank" || tags.healthcare === "blood_donation") {
    return "blood_bank";
  }

  return null;
}

function buildAddress(tags: Record<string, string>) {
  const values = [
    tags["addr:housename"],
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:suburb"],
    tags["addr:place"],
    tags["addr:city"],
    tags["addr:district"],
    tags["addr:state"],
  ]
    .filter(Boolean)
    .join(", ");

  return values || tags["addr:full"] || tags.description || "Address unavailable";
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isDuplicatePlace(left: EmergencyPlace, right: EmergencyPlace) {
  if (left.category !== right.category) {
    return false;
  }

  const sameName = normalizeText(left.name) === normalizeText(right.name);
  const sameAddress =
    left.address !== "Address unavailable" &&
    right.address !== "Address unavailable" &&
    normalizeText(left.address) === normalizeText(right.address);
  const nearbyDistance = calculateDistanceKm(left, right) <= 0.12;

  if (sameName && nearbyDistance) {
    return true;
  }

  return sameName && sameAddress;
}

function pickBetterPlace(left: EmergencyPlace, right: EmergencyPlace) {
  return scorePlace(right) > scorePlace(left) ? right : left;
}

function scorePlace(place: EmergencyPlace) {
  let score = 0;

  if (place.name && place.name !== CATEGORY_META[place.category].shortLabel) {
    score += 3;
  }
  if (place.address !== "Address unavailable") {
    score += 2;
  }
  if (place.phone) {
    score += 2;
  }
  if (Object.keys(place.tags).length > 3) {
    score += 1;
  }

  return score;
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/[\s,.-]+/g, " ");
}

async function requestOverpass(query: string): Promise<OverpassResponse> {
  let lastError: Error | null = null;

  for (const url of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = globalThis.setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

    try {
      logOverpass("Generated query", query);
      logOverpass("Request URL", url);
      const body = new URLSearchParams({ data: query }).toString();

      const response = await fetch(url, {
        body,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        method: "POST",
        signal: controller.signal,
      });

      logOverpass("Response status", response.status);

      if (!response.ok) {
        throw new Error(`Overpass request failed with status ${response.status}`);
      }

      const data = (await response.json()) as OverpassResponse;
      return data;
    } catch (error) {
      lastError =
        error instanceof Error ? error : new Error("Unknown Overpass request failure");
      logOverpass("Request failure", `${url} :: ${lastError.message}`);
    } finally {
      globalThis.clearTimeout(timeoutId);
    }
  }

  throw new Error(
    lastError?.name === "AbortError"
      ? "Nearby emergency services timed out. Please try again."
      : lastError?.message ?? "Unable to load nearby emergency services right now.",
  );
}

function validateOverpassQuery(query: string) {
  const trimmed = query.trim();
  const hasHeader = trimmed.startsWith("[out:json]");
  const hasOut = /\bout center tags\b/.test(trimmed) || /\bout center tags 30\b/.test(trimmed);
  const balancedParens =
    (trimmed.match(/\(/g) ?? []).length === (trimmed.match(/\)/g) ?? []).length;

  if (!hasHeader || !hasOut || !balancedParens) {
    throw new Error("Generated Overpass query is invalid.");
  }
}

function logOverpass(label: string, value: unknown) {
  if (!DEV_MODE) {
    return;
  }

  console.log(`[Overpass] ${label}:`, value);
}
