export type RadiusOption = 5 | 10 | 20 | 30 | 50;

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type EmergencyCategory =
  | "hospital"
  | "police"
  | "fire_station"
  | "pharmacy"
  | "blood_bank";

export type EmergencyPlace = {
  address: string;
  category: EmergencyCategory;
  distanceKm: number;
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  phone?: string;
  tags: Record<string, string>;
};

export type SearchLocation = Coordinates & {
  address: string;
  name: string;
  type: string;
};

export type WeatherSnapshot = {
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  temperature: number;
  weatherCode: number;
  weatherLabel: string;
  windSpeed: number;
};

export type DisasterAlert = {
  description: string;
  link: string;
  title: string;
};
