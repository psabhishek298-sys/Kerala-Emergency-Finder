import { LoaderCircle, MapPinned, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { EmergencyPlace, SearchLocation } from "@/types";

export function SearchPanel({
  directMatches,
  isLoading,
  onLocationPick,
  onSubmit,
  query,
  results,
  setQuery,
}: {
  directMatches: EmergencyPlace[];
  isLoading: boolean;
  onLocationPick: (location: SearchLocation) => void;
  onSubmit: () => void;
  query: string;
  results: SearchLocation[];
  setQuery: (value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="glass-panel flex flex-col gap-3 rounded-[1.6rem] p-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-full bg-white/70 px-4 py-1 shadow-inner">
          <Search className="h-4 w-4 text-slate-400" />
          <Input
            className="h-10 border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onSubmit();
              }
            }}
            placeholder="Search hospitals, towns, villages, districts, or landmarks in Kerala"
            value={query}
          />
        </div>
        <button
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#0058bc] px-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,88,188,0.22)] transition hover:scale-[1.01]"
          onClick={onSubmit}
          type="button"
        >
          {isLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            <MapPinned className="h-4 w-4" />
          )}
          Search Kerala
        </button>
      </div>
      {(results.length > 0 || directMatches.length > 0) && (
        <div className="grid gap-3 md:grid-cols-2">
          {results.slice(0, 4).map((location) => (
            <button
              className="glass-panel rounded-[1.4rem] p-4 text-left transition hover:-translate-y-0.5"
              key={`${location.latitude}-${location.longitude}`}
              onClick={() => onLocationPick(location)}
              type="button"
            >
              <p className="text-sm font-semibold text-slate-900">{location.name}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-[#0058bc]">
                {location.type}
              </p>
              <p className="mt-2 text-sm text-slate-500">{location.address}</p>
            </button>
          ))}
          {directMatches.slice(0, 4).map((place) => (
            <div className="glass-panel rounded-[1.4rem] p-4" key={place.id}>
              <p className="text-sm font-semibold text-slate-900">{place.name}</p>
              <p className="mt-2 text-sm text-slate-500">{place.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
