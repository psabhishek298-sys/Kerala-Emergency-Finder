import type { Coordinates, EmergencyCategory, RadiusOption } from "@/types";

export const DEFAULT_RADIUS: RadiusOption = 30;

export const RADIUS_OPTIONS: RadiusOption[] = [5, 10, 20, 30, 50];

export const KERALA_CENTER: Coordinates = {
  latitude: 10.8505,
  longitude: 76.2711,
};

export const KERALA_VIEWBOX = {
  bottom: 8.17,
  left: 74.85,
  right: 77.43,
  top: 12.88,
};

export const CATEGORY_META: Record<
  EmergencyCategory,
  {
    color: string;
    icon: string;
    label: string;
    shortLabel: string;
  }
> = {
  hospital: {
    color: "#ba1a1a",
    icon: "plus",
    label: "Hospitals",
    shortLabel: "Hospitals",
  },
  police: {
    color: "#0058bc",
    icon: "shield",
    label: "Police Stations",
    shortLabel: "Police",
  },
  fire_station: {
    color: "#c64f00",
    icon: "flame",
    label: "Fire Stations",
    shortLabel: "Fire",
  },
  pharmacy: {
    color: "#16a34a",
    icon: "pill",
    label: "Pharmacies",
    shortLabel: "Pharmacy",
  },
  blood_bank: {
    color: "#7c3aed",
    icon: "droplets",
    label: "Blood Banks",
    shortLabel: "Blood Banks",
  },
};

export const EMERGENCY_NUMBERS = [
  {
    description: "Pan-India emergency response for police, fire, and medical aid.",
    label: "ERSS",
    number: "112",
  },
  {
    description: "Fire and rescue helpline commonly routed through local emergency control.",
    label: "Fire",
    number: "101",
  },
  {
    description: "Ambulance helpline used across India for emergency medical support.",
    label: "Ambulance",
    number: "102",
  },
  {
    description: "Kerala State Disaster Management Authority control room.",
    label: "KSDMA",
    number: "0471-2778855",
  },
];
