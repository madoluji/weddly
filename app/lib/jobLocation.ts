export type JobLocation = {
  lat: number;
  lng: number;
  address?: string;
  type?: "Point";
  coordinates?: [number, number];
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isValidLatitude = (lat: unknown): lat is number =>
  isFiniteNumber(lat) && lat >= -90 && lat <= 90;

export const isValidLongitude = (lng: unknown): lng is number =>
  isFiniteNumber(lng) && lng >= -180 && lng <= 180;

export const parseJobLocation = (value: unknown): JobLocation | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const location = value as Record<string, unknown>;
  const lat = location.lat;
  const lng = location.lng;

  if (isValidLatitude(lat) && isValidLongitude(lng)) {
    return {
      lat,
      lng,
      address: typeof location.address === "string" ? location.address : undefined,
      type: "Point",
      coordinates: [lng, lat],
    };
  }

  const coordinates = location.coordinates;
  if (
    Array.isArray(coordinates) &&
    coordinates.length === 2 &&
    isValidLongitude(coordinates[0]) &&
    isValidLatitude(coordinates[1])
  ) {
    return {
      lat: coordinates[1],
      lng: coordinates[0],
      address: typeof location.address === "string" ? location.address : undefined,
      type: "Point",
      coordinates: [coordinates[0], coordinates[1]],
    };
  }

  return null;
};

export const toLocationPayload = (location: JobLocation): JobLocation => ({
  lat: location.lat,
  lng: location.lng,
  address: location.address,
  type: "Point",
  coordinates: [location.lng, location.lat],
});

export const getLocationDisplay = (
  location: unknown,
  fallback = "Remote"
): string => {
  if (typeof location === "string" && location.trim().length > 0) {
    return location;
  }

  const parsed = parseJobLocation(location);
  if (!parsed) {
    return fallback;
  }

  if (parsed.address && parsed.address.trim().length > 0) {
    return parsed.address;
  }

  return `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`;
};

export const buildMapLink = (location: unknown): string => {
  const parsed = parseJobLocation(location);

  if (parsed) {
    return `https://www.google.com/maps?q=${parsed.lat},${parsed.lng}`;
  }

  const label = getLocationDisplay(location, "");
  if (label) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      label
    )}`;
  }

  return "https://www.google.com/maps";
};