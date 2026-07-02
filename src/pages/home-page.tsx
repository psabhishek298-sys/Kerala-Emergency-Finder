import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  CloudSun,
  Crosshair,
  Gauge,
  LocateFixed,
  MapPinned,
  PhoneCall,
  Search,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CategoryFilterBar } from "@/components/home/category-filter-bar";
import { DisasterAlertsCard } from "@/components/home/disaster-alerts-card";
import { LazyMap } from "@/components/home/lazy-map";
import { RadiusSelector } from "@/components/home/radius-selector";
import { ResultsPanel } from "@/components/home/results-panel";
import { SearchPanel } from "@/components/home/search-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  CATEGORY_META,
  DEFAULT_RADIUS,
  EMERGENCY_NUMBERS,
  KERALA_CENTER,
} from "@/lib/constants";
import { useDisasterAlerts } from "@/hooks/use-disaster-alerts";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useKeralaSearch } from "@/hooks/use-kerala-search";
import { useNearbyServices } from "@/hooks/use-nearby-services";
import { useWeather } from "@/hooks/use-weather";
import type {
  EmergencyCategory,
  EmergencyPlace,
  RadiusOption,
  SearchLocation,
} from "@/types";

type SectionId = "alerts" | "location" | "numbers" | "radius" | "weather";

export function HomePage() {
  const [activeSection, setActiveSection] = useState<SectionId>("location");
  const [radius, setRadius] = useState<RadiusOption>(DEFAULT_RADIUS);
  const [queryDraft, setQueryDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [activePlace, setActivePlace] = useState<EmergencyPlace | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | null>(null);
  const { error, isLoading, permissionState, position, requestLocation } = useGeolocation();

  const activeCenter = searchLocation ?? position ?? KERALA_CENTER;
  const nearbyQuery = useNearbyServices(activeCenter, radius, Boolean(position || searchLocation));
  const weatherQuery = useWeather(activeCenter);
  const alertsQuery = useDisasterAlerts();
  const searchQueryResult = useKeralaSearch(searchQuery, activeCenter);

  const places = useMemo(() => nearbyQuery.data ?? [], [nearbyQuery.data]);
  const filteredPlaces = useMemo(
    () =>
      selectedCategory
        ? places.filter((place) => place.category === selectedCategory)
        : places,
    [places, selectedCategory],
  );
  const searchResults = searchQueryResult.data?.locations ?? [];
  const directMatches = searchQueryResult.data?.directMatches ?? [];
  const nearbyErrorMessage =
    nearbyQuery.error instanceof Error
      ? nearbyQuery.error.message
      : "Unable to load nearby emergency services right now.";

  useEffect(() => {
    if (!searchQuery.trim()) {
      return;
    }

    if (searchQueryResult.data?.locations?.length) {
      setSearchLocation(searchQueryResult.data.locations[0]);
      setActivePlace(null);
    }
  }, [searchQuery, searchQueryResult.data]);

  const toggleCategory = (category: EmergencyCategory) => {
    setSelectedCategory((current) => (current === category ? null : category));
  };

  const navigateToSection = (section: SectionId) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const selectedLocationLabel = searchLocation
    ? searchLocation.name
    : position
      ? `${position.latitude.toFixed(2)}, ${position.longitude.toFixed(2)}`
      : "Waiting for location";

  return (
    <div className="min-h-screen bg-[#f9f9ff] text-[#181c23]">
      <header className="sticky top-0 z-[600] flex h-16 items-center justify-between border-b border-white/30 bg-[#f9f9ff]/80 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e2ff] bg-white text-[#0058bc]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <p className="text-sm font-semibold text-[#0058bc]">KeralaCare</p>
        </div>
        <div className="hidden text-sm font-medium text-[#0058bc] md:block">Live Status</div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 shadow-inner lg:flex">
            <Search className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">Search services...</span>
          </div>
          <ThemeToggle />
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-white/70 text-slate-500 transition hover:text-[#0058bc]"
            onClick={requestLocation}
            type="button"
          >
            <LocateFixed className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-4rem)] gap-6 pt-6 md:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden md:flex md:flex-col">
          <div className="glass-panel sticky top-24 flex h-[calc(100vh-7rem)] flex-col rounded-[2rem] px-4 py-5">
            <div className="mb-6 flex items-center gap-3 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8e2ff] text-sm font-bold text-[#0058bc]">
                KS
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Emergency Hub</h2>
                <p className="text-xs text-slate-500">Kerala State</p>
              </div>
            </div>
            <nav className="space-y-1">
              {[
                { icon: LocateFixed, label: "Location", section: "location" as const },
                { icon: Gauge, label: "Radius", section: "radius" as const },
                { icon: CloudSun, label: "Weather", section: "weather" as const },
                { icon: PhoneCall, label: "Numbers", section: "numbers" as const },
                { icon: Siren, label: "Alerts", section: "alerts" as const },
              ].map(({ icon: Icon, label, section }) => {
                const active = activeSection === section;
                return (
                  <button
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${active ? "bg-[#0058bc] text-white shadow-[0_18px_36px_rgba(0,88,188,0.22)]" : "text-slate-500 hover:bg-white/60"}`}
                    key={label}
                    onClick={() => navigateToSection(section)}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto space-y-4">
              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Location</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedLocationLabel}</p>
                <p className="mt-1 text-xs text-slate-500">Permission: {permissionState}</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Weather</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">
                  {weatherQuery.data ? `${Math.round(weatherQuery.data.temperature)} deg C` : "--"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {weatherQuery.data?.weatherLabel ?? "Loading local weather"}
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-6">
          <motion.section
            animate={{ opacity: 1, y: 0 }}
            id="location"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="max-w-4xl">
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-slate-950 md:text-5xl">
                Find Nearby <span className="text-[#0058bc]">Emergency Services</span>
                <br />
                Across Kerala
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-slate-500 md:text-base">
                Instant access to verified hospitals, police stations, pharmacies, blood banks,
                and disaster response units in your immediate vicinity.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <SearchPanel
                directMatches={directMatches}
                isLoading={searchQueryResult.isFetching}
                onLocationPick={(location) => {
                  setSearchLocation(location);
                  setActivePlace(null);
                }}
                onSubmit={() => setSearchQuery(queryDraft.trim())}
                query={queryDraft}
                results={searchResults}
                setQuery={setQueryDraft}
              />

              <div className="grid gap-4 md:grid-cols-3">
                <Card className="rounded-[1.8rem] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Selected Area</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {searchLocation?.name ?? "Current location"}
                      </h3>
                    </div>
                    <MapPinned className="h-5 w-5 text-[#0058bc]" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {searchLocation?.address ??
                      (position
                        ? `${position.latitude.toFixed(5)}, ${position.longitude.toFixed(5)}`
                        : "Allow location or search a place in Kerala")}
                  </p>
                </Card>

                <Card className="rounded-[1.8rem] p-5" id="weather">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Weather</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {weatherQuery.data ? `${Math.round(weatherQuery.data.temperature)} deg C` : "--"}
                      </h3>
                    </div>
                    <CloudSun className="h-5 w-5 text-[#0058bc]" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {weatherQuery.data?.weatherLabel ?? "Loading local weather"}
                  </p>
                </Card>

                <Card className="rounded-[1.8rem] p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">
                        {filteredPlaces.length} places
                      </h3>
                    </div>
                    <Crosshair className="h-5 w-5 text-[#0058bc]" />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {searchLocation
                      ? `Showing nearby services around ${searchLocation.name}`
                      : "Showing nearby services around your detected location"}
                  </p>
                </Card>
              </div>
            </div>
          </motion.section>

          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4" id="radius">
              <div className="flex flex-wrap gap-3">
                <Badge className="gap-2 bg-white/70 px-4 py-2 text-slate-600">
                  <Crosshair className="h-3.5 w-3.5" />
                  Geolocation enabled
                </Badge>
                <Badge className="gap-2 bg-white/70 px-4 py-2 text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Live Overpass + OSM
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">Radius</span>
                <RadiusSelector onChange={setRadius} value={radius} />
              </div>
            </div>

            <LazyMap
              activePlace={activePlace}
              center={activeCenter}
              navigationOrigin={activeCenter}
              places={filteredPlaces}
              radiusKm={radius}
              searchLocation={searchLocation}
              userLocation={position}
            />

            <div className="space-y-4">
              <CategoryFilterBar
                onToggle={toggleCategory}
                selectedCategory={selectedCategory}
              />

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                {(Object.keys(CATEGORY_META) as EmergencyCategory[]).map((category) => {
                  const meta = CATEGORY_META[category];
                  const count = places.filter((place) => place.category === category).length;
                  const active = selectedCategory === category;

                  return (
                    <div
                      className={`rounded-[1.4rem] border p-4 transition ${active ? "bg-white/80 shadow-[0_14px_30px_rgba(15,23,42,0.06)]" : "bg-white/45"}`}
                      key={category}
                      style={{ borderColor: `${meta.color}22` }}
                    >
                      <p className="text-xs uppercase tracking-[0.22em]" style={{ color: meta.color }}>
                        {meta.shortLabel}
                      </p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{count}</p>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-5">
                <div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 16 }}
                      key={`${activeCenter.latitude}-${activeCenter.longitude}-${radius}-${selectedCategory ?? "all"}`}
                      transition={{ duration: 0.3 }}
                    >
                      <ResultsPanel
                        errorMessage={nearbyQuery.isError ? nearbyErrorMessage : undefined}
                        isLoading={nearbyQuery.isLoading || nearbyQuery.isFetching}
                        navigationOrigin={activeCenter}
                        onFocus={setActivePlace}
                        places={filteredPlaces}
                        radiusLabel={`${radius} km`}
                        title={searchLocation ? searchLocation.name : "Your current area"}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="grid gap-5 xl:grid-cols-2">
                  <Card className="rounded-[1.8rem] p-5" id="numbers">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">
                          Emergency Numbers
                        </p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">
                          Direct response lines
                        </h3>
                      </div>
                      <PhoneCall className="h-5 w-5 text-[#0058bc]" />
                    </div>
                    <div className="mt-4 grid gap-3">
                      {EMERGENCY_NUMBERS.map((item) => (
                        <a
                          className="flex items-center justify-between rounded-[1.2rem] bg-white/70 px-4 py-3 text-sm"
                          href={`tel:${item.number}`}
                          key={item.number}
                        >
                          <span className="font-medium text-slate-700">{item.label}</span>
                          <span className="font-semibold text-[#0058bc]">{item.number}</span>
                        </a>
                      ))}
                    </div>
                  </Card>

                  <Card className="rounded-[1.8rem] p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Status</p>
                        <h3 className="mt-2 text-lg font-semibold text-slate-950">Live environment</h3>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-[#c64f00]" />
                    </div>
                    <div className="mt-4 space-y-2 text-sm text-slate-500">
                      <p>Weather: {weatherQuery.data?.weatherLabel ?? "Loading"}</p>
                      <p>Disaster alerts: {(alertsQuery.data ?? []).length} active items</p>
                      <p>Permission: {permissionState}</p>
                      {searchLocation && (
                        <Button
                          className="mt-3"
                          onClick={() => {
                            setSearchLocation(null);
                            setActivePlace(null);
                            setSearchQuery("");
                          }}
                          variant="outline"
                        >
                          Use my location
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      )}
                      {error && <p className="text-destructive">Location note: {error}</p>}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          <div id="alerts">
            <DisasterAlertsCard alerts={alertsQuery.data ?? []} isLoading={alertsQuery.isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
}
