import { fetchJson } from "@/lib/fetcher";
import type { Coordinates, WeatherSnapshot } from "@/types";

type WeatherResponse = {
  current: {
    apparent_temperature: number;
    precipitation: number;
    relative_humidity_2m: number;
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
  };
};

export async function fetchCurrentWeather(
  coords: Coordinates,
): Promise<WeatherSnapshot> {
  const params = new URLSearchParams({
    latitude: coords.latitude.toString(),
    longitude: coords.longitude.toString(),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
    timezone: "auto",
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const data = await fetchJson<WeatherResponse>(url);
  const current = data.current;

  return {
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    precipitation: current.precipitation,
    temperature: current.temperature_2m,
    weatherCode: current.weather_code,
    weatherLabel: mapWeatherCode(current.weather_code),
    windSpeed: current.wind_speed_10m,
  };
}

function mapWeatherCode(code: number) {
  if (code === 0) return "Clear sky";
  if ([1, 2, 3].includes(code)) return "Partly cloudy";
  if ([45, 48].includes(code)) return "Fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "Drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Variable conditions";
}
