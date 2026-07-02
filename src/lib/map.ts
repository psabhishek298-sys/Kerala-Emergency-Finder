import L from "leaflet";

export function createCategoryIcon(color: string) {
  return L.divIcon({
    className: "custom-map-marker",
    html: `<span style="display:flex;height:18px;width:18px;border-radius:9999px;border:3px solid white;background:${color};box-shadow:0 8px 24px rgba(15,23,42,.24)"></span>`,
    iconAnchor: [9, 9],
  });
}

export const currentLocationIcon = L.divIcon({
  className: "current-location-marker",
  html: `<span style="display:flex;align-items:center;justify-content:center;height:22px;width:22px;border-radius:9999px;background:rgba(37,99,235,.18);border:1px solid rgba(37,99,235,.35)"><span style="height:10px;width:10px;border-radius:9999px;background:#2563eb"></span></span>`,
  iconAnchor: [11, 11],
});

export const searchLocationIcon = L.divIcon({
  className: "search-location-marker",
  html: `<span style="display:flex;align-items:center;justify-content:center;height:22px;width:22px;border-radius:9999px;background:rgba(16,185,129,.2);border:1px solid rgba(16,185,129,.35)"><span style="height:10px;width:10px;border-radius:9999px;background:#10b981"></span></span>`,
  iconAnchor: [11, 11],
});
