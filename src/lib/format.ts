export function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }

  return `${distanceKm.toFixed(1)} km`;
}

export function formatPhone(phone?: string) {
  if (!phone) {
    return "Not available";
  }

  return phone.replace(/[;|]/g, " / ");
}

export function sanitizePhoneForLink(phone?: string) {
  if (!phone) {
    return undefined;
  }

  const cleaned = phone.replace(/[^\d+]/g, "");
  return cleaned || undefined;
}
