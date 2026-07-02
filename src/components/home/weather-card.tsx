import type { ReactNode } from "react";
import { CloudSun, Droplets, Thermometer, Wind } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WeatherSnapshot } from "@/types";

export function WeatherCard({
  isLoading,
  weather,
}: {
  isLoading: boolean;
  weather?: WeatherSnapshot;
}) {
  if (isLoading) {
    return (
      <Card className="space-y-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-12 w-32" />
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!weather) {
    return (
      <Card>
        <p className="text-sm text-muted-foreground">
          Weather information will appear once a location is available.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Current weather</p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight">
            {Math.round(weather.temperature)} deg C
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{weather.weatherLabel}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CloudSun className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Info icon={<Thermometer className="h-4 w-4" />} label="Feels like" value={`${Math.round(weather.apparentTemperature)} deg C`} />
        <Info icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${weather.humidity}%`} />
        <Info icon={<Wind className="h-4 w-4" />} label="Wind" value={`${Math.round(weather.windSpeed)} km/h`} />
        <Info icon={<CloudSun className="h-4 w-4" />} label="Precipitation" value={`${weather.precipitation} mm`} />
      </div>
    </Card>
  );
}

function Info({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
