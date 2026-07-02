import { useQuery } from "@tanstack/react-query";
import { fetchCurrentWeather } from "@/services/weather";
import type { Coordinates } from "@/types";

export function useWeather(center: Coordinates | null) {
  return useQuery({
    enabled: Boolean(center),
    queryFn: () => fetchCurrentWeather(center!),
    queryKey: ["weather", center?.latitude, center?.longitude],
    staleTime: 1000 * 60 * 15,
  });
}
