import type { Coordinates, EmergencyPlace } from "@/types";
import { CATEGORY_META } from "@/lib/constants";
import { ResultCard } from "@/components/home/result-card";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ResultsPanel({
  errorMessage,
  isLoading,
  navigationOrigin,
  onFocus,
  places,
  radiusLabel,
  title,
}: {
  errorMessage?: string;
  isLoading: boolean;
  navigationOrigin: Coordinates | null;
  onFocus: (place: EmergencyPlace) => void;
  places: EmergencyPlace[];
  radiusLabel: string;
  title: string;
}) {
  const grouped = Object.values(
    places.reduce<Record<string, EmergencyPlace[]>>((accumulator, place) => {
      const key = place.category;
      accumulator[key] ??= [];
      accumulator[key].push(place);
      return accumulator;
    }, {}),
  );

  return (
    <div className="space-y-5">
      <Card className="rounded-[1.8rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Nearby Places
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{title}</h3>
          </div>
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Radius</p>
            <p className="mt-1 text-sm font-semibold text-[#0058bc]">{radiusLabel}</p>
          </div>
        </div>
      </Card>

      {isLoading &&
        Array.from({ length: 4 }).map((_, index) => (
          <Skeleton className="h-52 w-full" key={index} />
        ))}

      {!isLoading && errorMessage && (
        <Card className="border-destructive/20 p-5 text-sm text-destructive">
          {errorMessage}
        </Card>
      )}

      {!isLoading && !errorMessage && places.length === 0 && (
        <Card className="p-5 text-sm text-muted-foreground">
          No emergency facilities were returned for this area. Try expanding the radius or searching a nearby town.
        </Card>
      )}

      {!errorMessage &&
        grouped.map((group) => {
          const category = group[0]?.category;
          if (!category) {
            return null;
          }

          return (
            <section className="space-y-3" key={category}>
              <div className="flex items-center gap-3 px-1">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: CATEGORY_META[category].color }}
                />
                <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {CATEGORY_META[category].label}
                </h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 [@media(min-width:2100px)]:grid-cols-6">
                {group.map((place) => (
                  <ResultCard
                    key={place.id}
                    navigationOrigin={navigationOrigin}
                    onFocus={onFocus}
                    place={place}
                  />
                ))}
              </div>
            </section>
          );
        })}
    </div>
  );
}
