import { ChevronRight, Heart, MapPinned, Phone } from "lucide-react";
import { CATEGORY_META } from "@/lib/constants";
import { formatDistance, formatPhone, sanitizePhoneForLink } from "@/lib/format";
import type { Coordinates, EmergencyPlace } from "@/types";

export function ResultCard({
  navigationOrigin,
  place,
  onFocus,
}: {
  navigationOrigin: Coordinates | null;
  onFocus: (place: EmergencyPlace) => void;
  place: EmergencyPlace;
}) {
  const phoneLink = sanitizePhoneForLink(place.phone);
  const meta = CATEGORY_META[place.category];
  const navigationUrl = navigationOrigin
    ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${navigationOrigin.latitude}%2C${navigationOrigin.longitude}%3B${place.latitude}%2C${place.longitude}`
    : `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=16/${place.latitude}/${place.longitude}`;

  return (
    <div
      className="group relative overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,248,255,0.82))] p-5 shadow-[0_20px_50px_rgba(15,23,42,0.07)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
    >
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{
          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}99, transparent)`,
        }}
      />
      <div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-60 blur-2xl"
        style={{ backgroundColor: `${meta.color}12` }}
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]"
              style={{
                backgroundColor: `${meta.color}12`,
                color: meta.color,
              }}
            >
              {meta.shortLabel}
            </div>
            <p className="mt-4 line-clamp-2 text-[1.15rem] font-semibold leading-7 tracking-[-0.02em] text-slate-950">
              {place.name}
            </p>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{place.address}</p>
          </div>
          <div className="shrink-0 rounded-full bg-white/85 px-3 py-2 text-sm font-semibold text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.06)]">
            {formatDistance(place.distanceKm)}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 rounded-[1.25rem] bg-white/55 px-4 py-3 ring-1 ring-white/70">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Phone</p>
            <p className="mt-1 truncate text-sm font-medium text-slate-600">{formatPhone(place.phone)}</p>
          </div>
          <button
            className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-slate-600"
            type="button"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 flex items-center gap-2">
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/80 text-slate-600 shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:scale-[1.03] hover:bg-white"
            onClick={() => onFocus(place)}
            type="button"
          >
            <MapPinned className="h-4 w-4" />
          </button>
          <a
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full shadow-[0_8px_20px_rgba(15,23,42,0.04)] transition hover:scale-[1.03] ${phoneLink ? "bg-[#eef4ff] text-[#0058bc] hover:bg-[#dde9ff]" : "pointer-events-none bg-slate-100 text-slate-300"}`}
            href={phoneLink ? `tel:${phoneLink}` : "#"}
          >
            <Phone className="h-4 w-4" />
          </a>
          <a
            className="inline-flex h-11 items-center justify-center rounded-full bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            href={navigationUrl}
            rel="noreferrer"
            target="_blank"
          >
            Navigate
            <ChevronRight className="ml-1.5 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
