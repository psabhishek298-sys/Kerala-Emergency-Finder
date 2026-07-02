import { useQuery } from "@tanstack/react-query";
import { searchKeralaLocations } from "@/services/nominatim";
import { searchEmergencyPlacesInKerala } from "@/services/overpass";
import type { Coordinates } from "@/types";

export function useKeralaSearch(queryText: string, center: Coordinates) {
  return useQuery({
    enabled: queryText.trim().length > 1,
    queryFn: async () => {
      const [locations, directMatches] = await Promise.all([
        searchKeralaLocations(queryText),
        searchEmergencyPlacesInKerala(queryText, center),
      ]);

      return { directMatches, locations };
    },
    queryKey: ["kerala-search", queryText, center.latitude, center.longitude],
    staleTime: 1000 * 60 * 10,
  });
}
