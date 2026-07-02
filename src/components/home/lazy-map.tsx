import { lazy, Suspense } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Coordinates, EmergencyPlace, SearchLocation } from "@/types";

const LazyMapView = lazy(async () => {
  const module = await import("@/components/home/map-view");
  return { default: module.MapView };
});

export function LazyMap(props: {
  activePlace: EmergencyPlace | null;
  center: Coordinates;
  navigationOrigin: Coordinates | null;
  places: EmergencyPlace[];
  radiusKm: number;
  searchLocation: SearchLocation | null;
  userLocation: Coordinates | null;
}) {
  return (
    <Card className="h-[460px] overflow-hidden rounded-[2rem] bg-white/70 p-3 lg:h-[calc(100vh-13rem)]">
      <Suspense fallback={<Skeleton className="h-full w-full rounded-[1.5rem]" />}>
        <LazyMapView {...props} />
      </Suspense>
    </Card>
  );
}
