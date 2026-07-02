import { useQuery } from "@tanstack/react-query";
import { fetchNearbyEmergencyPlaces } from "@/services/overpass";
import type { Coordinates } from "@/types";

export function useNearbyServices(
  center: Coordinates | null,
  radiusKm: number,
  enabled = true,
) {
  return useQuery({
    enabled: Boolean(center) && enabled,
    queryFn: () => fetchNearbyEmergencyPlaces(center!, radiusKm),
    queryKey: ["nearby-services", center?.latitude, center?.longitude, radiusKm],
  });
}
