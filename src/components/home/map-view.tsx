import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet.markercluster";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { CATEGORY_META } from "@/lib/constants";
import { formatDistance, formatPhone } from "@/lib/format";
import { createCategoryIcon, currentLocationIcon, searchLocationIcon } from "@/lib/map";
import type { Coordinates, EmergencyPlace, SearchLocation } from "@/types";

export function MapView({
  activePlace,
  center,
  navigationOrigin,
  places,
  radiusKm,
  searchLocation,
  userLocation,
}: {
  activePlace: EmergencyPlace | null;
  center: Coordinates;
  navigationOrigin: Coordinates | null;
  places: EmergencyPlace[];
  radiusKm: number;
  searchLocation: SearchLocation | null;
  userLocation: Coordinates | null;
}) {
  const icons = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(CATEGORY_META).map(([key, value]) => [key, createCategoryIcon(value.color)]),
      ),
    [],
  );

  const buildNavigationUrl = (place: EmergencyPlace) =>
    navigationOrigin
      ? `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${navigationOrigin.latitude}%2C${navigationOrigin.longitude}%3B${place.latitude}%2C${place.longitude}`
      : `https://www.openstreetmap.org/?mlat=${place.latitude}&mlon=${place.longitude}#map=16/${place.latitude}/${place.longitude}`;

  return (
    <MapContainer center={[center.latitude, center.longitude]} scrollWheelZoom zoom={11}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater activePlace={activePlace} center={center} />
      <EmergencyClusters buildNavigationUrl={buildNavigationUrl} icons={icons} places={places} />
      <Circle
        center={[center.latitude, center.longitude]}
        pathOptions={{ color: "#2563eb", fillOpacity: 0.06, weight: 1.5 }}
        radius={radiusKm * 1000}
      />
      {userLocation && (
        <Marker icon={currentLocationIcon} position={[userLocation.latitude, userLocation.longitude]}>
          <Popup>Your current location</Popup>
        </Marker>
      )}
      {searchLocation && (
        <Marker icon={searchLocationIcon} position={[searchLocation.latitude, searchLocation.longitude]}>
          <Popup>{searchLocation.name}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

function EmergencyClusters({
  buildNavigationUrl,
  icons,
  places,
}: {
  buildNavigationUrl: (place: EmergencyPlace) => string;
  icons: Record<string, L.DivIcon>;
  places: EmergencyPlace[];
}) {
  const map = useMap();

  useEffect(() => {
    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
    });

    places.forEach((place) => {
      const marker = L.marker([place.latitude, place.longitude], {
        icon: icons[place.category],
      });

      marker.bindPopup(`
        <div style="width: 250px; font-family: 'Segoe UI', sans-serif; color: #0f172a;">
          <p style="margin: 0 0 8px; font-weight: 700;">${escapeHtml(place.name)}</p>
          <p style="margin: 0 0 8px; font-size: 12px; color: #475569;">${escapeHtml(place.address)}</p>
          <p style="margin: 0 0 6px; font-size: 12px;">Distance: ${escapeHtml(formatDistance(place.distanceKm))}</p>
          <p style="margin: 0 0 10px; font-size: 12px;">Phone: ${escapeHtml(formatPhone(place.phone))}</p>
          <a
            href="${buildNavigationUrl(place)}"
            target="_blank"
            rel="noreferrer"
            style="display: inline-flex; width: 100%; justify-content: center; border-radius: 999px; background: #2563eb; color: white; padding: 10px 14px; text-decoration: none; font-size: 12px; font-weight: 600;"
          >Navigate</a>
        </div>
      `);

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [buildNavigationUrl, icons, map, places]);

  return null;
}

function MapUpdater({
  activePlace,
  center,
}: {
  activePlace: EmergencyPlace | null;
  center: Coordinates;
}) {
  const map = useMap();

  useEffect(() => {
    if (activePlace) {
      map.flyTo([activePlace.latitude, activePlace.longitude], 14, { duration: 1.25 });
      return;
    }

    map.flyTo([center.latitude, center.longitude], 11, { duration: 1.15 });
  }, [activePlace, center.latitude, center.longitude, map]);

  return null;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
