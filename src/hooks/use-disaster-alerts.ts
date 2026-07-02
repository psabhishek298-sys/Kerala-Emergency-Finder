import { useQuery } from "@tanstack/react-query";
import { fetchKeralaDisasterAlerts } from "@/services/ksdma";

export function useDisasterAlerts() {
  return useQuery({
    queryFn: fetchKeralaDisasterAlerts,
    queryKey: ["kerala-disaster-alerts"],
    staleTime: 1000 * 60 * 10,
  });
}
