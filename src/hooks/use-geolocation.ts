import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "@/types";

type GeolocationState = {
  error: string | null;
  isLoading: boolean;
  permissionState: PermissionState | "unsupported" | "unknown";
  position: Coordinates | null;
  requestLocation: () => void;
};

export function useGeolocation(): GeolocationState {
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<
    PermissionState | "unsupported" | "unknown"
  >("unknown");

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
      setError("Geolocation is not supported in this browser.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (coords) => {
        setPosition({
          latitude: coords.coords.latitude,
          longitude: coords.coords.longitude,
        });
        setError(null);
        setPermissionState("granted");
        setIsLoading(false);
      },
      (geoError) => {
        setError(geoError.message);
        setPermissionState(geoError.code === geoError.PERMISSION_DENIED ? "denied" : "prompt");
        setIsLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (navigator.permissions) {
      void navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          setPermissionState(result.state);
          result.addEventListener("change", () => setPermissionState(result.state));
        })
        .catch(() => undefined);
    }

    requestLocation();
  }, [requestLocation]);

  return { error, isLoading, permissionState, position, requestLocation };
}
