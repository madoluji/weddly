"use client";

import "leaflet/dist/leaflet.css";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import { divIcon, type LatLngLiteral, type Map as LeafletMap } from "leaflet";
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";

import {
  type JobLocation,
  parseJobLocation,
  toLocationPayload,
} from "@/app/lib/jobLocation";

type JobLocationPickerProps = {
  value: JobLocation | null;
  onChange: (value: JobLocation) => void;
};

const DEFAULT_CENTER: LatLngLiteral = {
  lat: 27.7172,
  lng: 85.324,
};

const GOOGLE_SCRIPT_ID = "google-places-script";

const sanitizeAddress = (value: string): string =>
  value.replace(/<[^>]*>?/gm, "").trim();

const buildReverseGeoUrl = (lat: number, lng: number): string =>
  `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;

const buildSearchGeoUrl = (query: string): string =>
  `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=np&bounded=1&q=${encodeURIComponent(
    query
  )}`;

// Loose bounding box for Nepal to prevent fallback results outside Nepal.
// (Search results can still include neighboring countries unless bounded/filtering is applied.)
const NEPAL_BOUNDS = {
  latMin: 26.347, // approx
  latMax: 30.457, // approx
  lngMin: 80.057, // approx
  lngMax: 88.187, // approx
};

const isLikelyInNepal = ({ lat, lng }: LatLngLiteral) =>
  lat >= NEPAL_BOUNDS.latMin &&
  lat <= NEPAL_BOUNDS.latMax &&
  lng >= NEPAL_BOUNDS.lngMin &&
  lng <= NEPAL_BOUNDS.lngMax;

const markerIcon = divIcon({
  className: "job-location-pin",
  html: '<span class="job-location-pin__outer"><span class="job-location-pin__dot"></span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const MapEvents = ({
  onSelect,
}: {
  onSelect: (point: LatLngLiteral) => void;
}) => {
  useMapEvents({
    click: (event) => {
      onSelect({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
};

const RecenterMap = ({ center }: { center: LatLngLiteral }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(center, 14, {
      duration: 0.7,
    });
  }, [center, map]);

  return null;
};

const MapLifecycle = ({
  onReady,
  onDispose,
}: {
  onReady: (map: LeafletMap) => void;
  onDispose: (map: LeafletMap | null) => void;
}) => {
  const map = useMap();

  useEffect(() => {
    onReady(map);

    return () => {
      onDispose(map);
    };
  }, [map, onDispose, onReady]);

  return null;
};

const JobLocationPicker = ({ value, onChange }: JobLocationPickerProps) => {
  const [search, setSearch] = useState("");
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [lastSubmittedQuery, setLastSubmittedQuery] = useState<string | null>(
    null
  );
  const [fallbackTriggeredFor, setFallbackTriggeredFor] = useState<
    string | null
  >(null);
  const [searchFallbackResults, setSearchFallbackResults] = useState<JobLocation[]>(
    []
  );
  const [pinVersion, setPinVersion] = useState(0);
  const [googleReady, setGoogleReady] = useState(false);
  const mapMountKey = useId();
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const applyLocationRequestIdRef = useRef(0);

  const disposeMapInstance = useCallback((map: LeafletMap | null) => {
    if (!map) {
      return;
    }

    try {
      map.off();
    } catch {
      // ignore
    }

    try {
      map.remove();
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    return () => {
      disposeMapInstance(mapInstanceRef.current);
      mapInstanceRef.current = null;
    };
  }, [disposeMapInstance]);

  const activeLocation = useMemo(
    () => parseJobLocation(value) ?? null,
    [value]
  );
  const setMapInstanceRef = useCallback((map: LeafletMap) => {
    mapInstanceRef.current = map;

    // Leaflet throws if `remove()` runs after another map instance
    // took over the same container. Prevent crashing the page.
    const originalRemove = map.remove.bind(map);
    (map as any).remove = () => {
      try {
        // Reconcile Leaflet's internal container id so `remove()` doesn't
        // throw when another map briefly took over the same DOM node.
        if ((map as any)._container) {
          const currentLeafletId = (map as any)._container._leaflet_id;
          if (
            currentLeafletId !== undefined &&
            (map as any)._containerId !== currentLeafletId
          ) {
            (map as any)._containerId = currentLeafletId;
          }
        }
      } catch {
        // fall through to original remove
      }

      try {
        return originalRemove();
      } catch {
        return map;
      }
    };
  }, []);

  const clearMapInstanceRef = useCallback((map: LeafletMap | null) => {
    disposeMapInstance(map);

    if (mapInstanceRef.current === map) {
      mapInstanceRef.current = null;
    }
  }, [disposeMapInstance]);

  const mapCenter = activeLocation
    ? { lat: activeLocation.lat, lng: activeLocation.lng }
    : DEFAULT_CENTER;

  const {
    ready,
    setValue,
    suggestions: { data, status },
    clearSuggestions,
    init,
  } = usePlacesAutocomplete({
    
    cacheKey: "places-autocomplete-np",
    debounce: 250,
    initOnMount: false,
  });

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      return;
    }

    if (window.google?.maps?.places) {
      setGoogleReady(true);
      init();
      return;
    }

    const existing = document.getElementById(
      GOOGLE_SCRIPT_ID
    ) as HTMLScriptElement | null;

    const onLoaded = () => {
      setGoogleReady(true);
      init();
    };

    if (existing) {
      existing.addEventListener("load", onLoaded);
      return () => existing.removeEventListener("load", onLoaded);
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", onLoaded);
    document.head.appendChild(script);

    return () => {
      script.removeEventListener("load", onLoaded);
    };
  }, [init]);

  const resolveAddress = async (
    lat: number,
    lng: number,
    fallbackAddress?: string
  ) => {
    setLoadingAddress(true);
    try {
      if (googleReady && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(endpoint);
        const dataJson = await response.json();
        const address = dataJson?.results?.[0]?.formatted_address;
        return typeof address === "string" ? sanitizeAddress(address) : fallbackAddress;
      }

      const response = await fetch(buildReverseGeoUrl(lat, lng), {
        headers: {
          "Accept-Language": "en",
        },
      });
      const dataJson = await response.json();
      return typeof dataJson?.display_name === "string"
        ? sanitizeAddress(dataJson.display_name)
        : fallbackAddress;
    } catch {
      return fallbackAddress;
    } finally {
      setLoadingAddress(false);
    }
  };

  const applyLocation = async (
    point: LatLngLiteral,
    fallbackAddress?: string
  ) => {
    const requestId = ++applyLocationRequestIdRef.current;

    // Optimistic update: move the pin immediately, while address resolution
    // happens async (prevents the “pin lags behind the click” feeling).
    onChange(
      toLocationPayload({
        lat: point.lat,
        lng: point.lng,
        address: fallbackAddress,
      })
    );

    setSearchFallbackResults([]);
    setPinVersion((prev) => prev + 1);

    const resolvedAddress = await resolveAddress(
      point.lat,
      point.lng,
      fallbackAddress
    );

    // If user clicked again while the address request was in-flight,
    // ignore the earlier response.
    if (requestId !== applyLocationRequestIdRef.current) {
      return;
    }

    onChange(
      toLocationPayload({
        lat: point.lat,
        lng: point.lng,
        address: resolvedAddress,
      })
    );
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setLoadingAddress(false);
      },
      {
        enableHighAccuracy: true,
      }
    );
  };

  const searchWithFallback = useCallback(async (query: string) => {
    try {
      const response = await fetch(buildSearchGeoUrl(query), {
        headers: {
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        setSearchFallbackResults([]);
        return;
      }

      const json = (await response.json()) as Array<{
        lat: string;
        lon: string;
        display_name: string;
      }>;

      const parsed = json
        .map((result) => {
          const lat = Number.parseFloat(result.lat);
          const lng = Number.parseFloat(result.lon);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return null;
          }

          const point = { lat, lng };
          if (!isLikelyInNepal(point)) {
            return null;
          }

          return toLocationPayload({
            lat,
            lng,
            address: sanitizeAddress(result.display_name),
          });
        })
        .filter((item): item is JobLocation => Boolean(item));

      setSearchFallbackResults(parsed);
    } catch (error) {
      console.error("Nominatim fallback failed:", error);
      setSearchFallbackResults([]);
    }
  }, []);

  const onSearchSubmit = async () => {
    const query = search.trim();
    if (!query) {
      return;
    }

    setLastSubmittedQuery(query);
    setFallbackTriggeredFor(null);

    if (ready && googleReady) {
      setValue(query, true);
      return;
    }

    await searchWithFallback(query);
  };

  // If Google Places returns zero results for the submitted query,
  // fall back to Nominatim search so users still see Nepal places.
  useEffect(() => {
    if (!lastSubmittedQuery) {
      return;
    }

    // Only fallback when Google was attempted.
    if (!(ready && googleReady)) {
      return;
    }

    const shouldFallback =
      status !== "OK" || (Array.isArray(data) && data.length === 0);

    if (!shouldFallback || fallbackTriggeredFor === lastSubmittedQuery) {
      return;
    }

    setFallbackTriggeredFor(lastSubmittedQuery);
    void searchWithFallback(lastSubmittedQuery);
  }, [
    data,
    fallbackTriggeredFor,
    googleReady,
    lastSubmittedQuery,
    ready,
    searchWithFallback,
    status,
  ]);

  // When Google Places isn't ready (or no API key), show Nepal results
  // automatically from Nominatim as the user types.
  useEffect(() => {
    if (googleReady) {
      // Avoid showing both Google suggestions and fallback results.
      setSearchFallbackResults([]);
      return;
    }

    const query = search.trim();
    if (!query) {
      setSearchFallbackResults([]);
      return;
    }

    const handle = window.setTimeout(() => {
      void searchWithFallback(query);
    }, 400);

    return () => {
      window.clearTimeout(handle);
    };
  }, [googleReady, search, searchWithFallback]);

  // If the user typed before Google finished initializing, populate suggestions
  // as soon as Google becomes ready.
  useEffect(() => {
    if (!ready || !googleReady) {
      return;
    }

    const query = search.trim();
    if (!query) {
      return;
    }

    setSearchFallbackResults([]);
    setValue(query);
  }, [googleReady, ready, search, setSearchFallbackResults, setValue]);

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 p-4 bg-white shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1 flex gap-2">
          <input
            value={search}
            onChange={(event) => {
              const next = event.target.value;
              setSearch(next);
              if (ready && googleReady) {
                setValue(next);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void onSearchSubmit();
              }
            }}
            placeholder="Search places..."
            className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="button"
            onClick={() => {
              void onSearchSubmit();
            }}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Search
          </button>
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="rounded-md border border-primary-500 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-50"
        >
          Use My Location
        </button>
      </div>

      {status === "OK" && data.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-white p-2 max-h-40 overflow-auto">
          {data.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
              onClick={async () => {
                const description = suggestion.description;
                setSearch(description);
                setValue(description, false);
                clearSuggestions();

                const geocode = await getGeocode({ address: description });
                const { lat, lng } = await getLatLng(geocode[0]);
                await applyLocation({ lat, lng }, description);
              }}
            >
              {suggestion.description}
            </button>
          ))}
        </div>
      )}

      {searchFallbackResults.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-white p-2 max-h-40 overflow-auto">
          {searchFallbackResults.map((result, index) => (
            <button
              key={`${result.lat}-${result.lng}-${index}`}
              type="button"
              className="w-full rounded-md px-2 py-2 text-left text-sm hover:bg-primary-50"
              onClick={() => {
                onChange(result);
                setSearch(result.address || "");
                setSearchFallbackResults([]);
                setPinVersion((prev) => prev + 1);
              }}
            >
              {result.address || `${result.lat}, ${result.lng}`}
            </button>
          ))}
        </div>
      )}

      <div className="h-[340px] overflow-hidden rounded-lg border border-gray-200">
        <MapContainer
          key={mapMountKey}
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
          scrollWheelZoom
        >
          <MapLifecycle onReady={setMapInstanceRef} onDispose={clearMapInstanceRef} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapEvents onSelect={applyLocation} />
          <RecenterMap center={mapCenter} />

          {activeLocation && (
            <Marker
              key={`${activeLocation.lat}-${activeLocation.lng}-${pinVersion}`}
              position={{ lat: activeLocation.lat, lng: activeLocation.lng }}
              icon={markerIcon}
              draggable
              eventHandlers={{
                dragend: (event) => {
                  const marker = event.target;
                  const point = marker.getLatLng();
                  applyLocation({ lat: point.lat, lng: point.lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
        {activeLocation ? (
          <>
            <p>
              <span className="font-medium">Latitude:</span> {activeLocation.lat.toFixed(6)}
            </p>
            <p>
              <span className="font-medium">Longitude:</span> {activeLocation.lng.toFixed(6)}
            </p>
            <p className="truncate">
              <span className="font-medium">Address:</span>{" "}
              {loadingAddress
                ? "Resolving address..."
                : activeLocation.address || "Not available"}
            </p>
          </>
        ) : (
          "Click on the map to drop a pin and select a location."
        )}
      </div>

      <style jsx global>{`
        .job-location-pin {
          animation: drop-pin 0.45s cubic-bezier(0.2, 0.85, 0.4, 1) both;
        }

        .job-location-pin__outer {
          position: relative;
          display: block;
          width: 24px;
          height: 24px;
          border-radius: 9999px 9999px 9999px 0;
          transform: rotate(-45deg);
          background: rgba(14, 165, 164, 0.95);
          box-shadow: 0 10px 18px rgba(14, 165, 164, 0.35);
          border: 2px solid #ffffff;
        }

        .job-location-pin__dot {
          position: relative;
          display: block;
          width: 8px;
          height: 8px;
          left: 7px;
          top: 7px;
          border-radius: 9999px;
          background: #ffffff;
          transform: rotate(45deg);
        }

        .job-location-pin__dot::after {
          content: "";
          position: absolute;
          left: -2px;
          top: -2px;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.35);
        }

        @keyframes drop-pin {
          0% {
            transform: translateY(-18px) scale(0.85);
            opacity: 0;
          }
          70% {
            transform: translateY(2px) scale(1.05);
            opacity: 1;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default JobLocationPicker;