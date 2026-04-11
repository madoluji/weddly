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

const buildStaticMapPreviewUrl = (center: LatLngLiteral): string => {
  const centerParam = `${center.lat},${center.lng}`;
  const markerParam = `${center.lat},${center.lng},lightblue1`;
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${encodeURIComponent(
    centerParam
  )}&zoom=13&size=1200x680&markers=${encodeURIComponent(markerParam)}`;
};

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

const RecenterMap = ({
  center,
  hasPinnedLocation,
}: {
  center: LatLngLiteral;
  hasPinnedLocation: boolean;
}) => {
  const map = useMap();
  const previousCenterRef = useRef<LatLngLiteral | null>(null);

  useEffect(() => {
    const previous = previousCenterRef.current;
    const hasMeaningfulChange =
      !previous ||
      Math.abs(previous.lat - center.lat) > 0.00001 ||
      Math.abs(previous.lng - center.lng) > 0.00001;

    if (!hasMeaningfulChange) {
      return;
    }

    // Do not force a broad zoom after selecting/searching a location.
    // Keep user zoom if it is already closer, otherwise move to a practical close-up level.
    const targetZoom = hasPinnedLocation ? Math.max(map.getZoom(), 16) : map.getZoom();

    if (!previous) {
      map.setView(center, targetZoom, { animate: false });
    } else {
      map.flyTo(center, targetZoom, {
        duration: 0.45,
      });
    }

    previousCenterRef.current = center;
  }, [center.lat, center.lng, hasPinnedLocation, map]);

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
  const [googleReady, setGoogleReady] = useState(false);
  const [interactiveMapEnabled, setInteractiveMapEnabled] = useState(false);
  const mapMountKey = useId();
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const reverseGeocodeAbortRef = useRef<AbortController | null>(null);
  const addressLookupIdRef = useRef(0);
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
      reverseGeocodeAbortRef.current?.abort();
      mapInstanceRef.current = null;
    };
  }, [disposeMapInstance]);

  const activeLocation = useMemo(
    () => parseJobLocation(value) ?? null,
    [value]
  );

  useEffect(() => {
    if (!interactiveMapEnabled) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const map = mapInstanceRef.current;
      if (!map) {
        return;
      }

      map.invalidateSize();

      if (activeLocation) {
        map.setView(
          { lat: activeLocation.lat, lng: activeLocation.lng },
          Math.max(map.getZoom(), 16),
          { animate: false }
        );
      }
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    activeLocation?.lat,
    activeLocation?.lng,
    interactiveMapEnabled,
  ]);

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
  const staticMapPreviewUrl = useMemo(
    () => buildStaticMapPreviewUrl(mapCenter),
    [mapCenter]
  );

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
    const lookupId = ++addressLookupIdRef.current;
    setLoadingAddress(true);

    reverseGeocodeAbortRef.current?.abort();
    const abortController = new AbortController();
    reverseGeocodeAbortRef.current = abortController;

    try {
      if (googleReady && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(endpoint, { signal: abortController.signal });
        const dataJson = await response.json();
        const address = dataJson?.results?.[0]?.formatted_address;
        return typeof address === "string" ? sanitizeAddress(address) : fallbackAddress;
      }

      const response = await fetch(buildReverseGeoUrl(lat, lng), {
        signal: abortController.signal,
        headers: {
          "Accept-Language": "en",
        },
      });
      const dataJson = await response.json();
      return typeof dataJson?.display_name === "string"
        ? sanitizeAddress(dataJson.display_name)
        : fallbackAddress;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return fallbackAddress;
      }
      return fallbackAddress;
    } finally {
      if (addressLookupIdRef.current === lookupId) {
        setLoadingAddress(false);
      }
      if (reverseGeocodeAbortRef.current === abortController) {
        reverseGeocodeAbortRef.current = null;
      }
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
    <div className="space-y-4 rounded-2xl bg-surface-container-highest/90 p-4 sm:p-5">
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
            className="h-11 flex-1 rounded-xl border-none bg-surface-container-low px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/80 transition-all focus:bg-surface-container-lowest focus:outline-none focus:ring-0 focus:shadow-[inset_0_-2px_0_0_#2f5f4a]"
          />
          <button
            type="button"
            onClick={() => {
              void onSearchSubmit();
            }}
            className="h-11 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary transition-colors hover:bg-primary-600"
          >
            Search
          </button>
        </div>

        <button
          type="button"
          onClick={useCurrentLocation}
          className="h-11 rounded-xl bg-secondary-container px-4 py-2 text-sm font-medium text-on-secondary-container transition-colors hover:bg-secondary-fixed"
        >
          Use My Location
        </button>
      </div>

      {status === "OK" && data.length > 0 && (
        <div className="max-h-40 overflow-auto rounded-xl bg-surface-container-low p-2">
          {data.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="w-full rounded-lg px-2 py-2 text-left text-sm text-on-surface transition-colors hover:bg-surface-container-lowest"
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
        <div className="max-h-40 overflow-auto rounded-xl bg-surface-container-low p-2">
          {searchFallbackResults.map((result, index) => (
            <button
              key={`${result.lat}-${result.lng}-${index}`}
              type="button"
              className="w-full rounded-lg px-2 py-2 text-left text-sm text-on-surface transition-colors hover:bg-surface-container-lowest"
              onClick={() => {
                void applyLocation(
                  { lat: result.lat, lng: result.lng },
                  result.address
                );
                setSearch(result.address || "");
                setSearchFallbackResults([]);
              }}
            >
              {result.address || `${result.lat}, ${result.lng}`}
            </button>
          ))}
        </div>
      )}

      <div className="h-[340px] overflow-hidden rounded-2xl bg-surface-container-low shadow-[0_12px_34px_rgba(27,28,26,0.05)]">
        {!interactiveMapEnabled ? (
          <div className="relative h-full w-full">
            <img
              src={staticMapPreviewUrl}
              alt="Venue location preview"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 px-4 py-3">
              <p className="rounded-lg bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-sm">
                Lite preview mode for faster performance
              </p>
              <button
                type="button"
                onClick={() => setInteractiveMapEnabled(true)}
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-on-primary transition-colors hover:bg-primary-600"
              >
                Open Interactive Map
              </button>
            </div>
          </div>
        ) : (
          <MapContainer
            key={mapMountKey}
            center={mapCenter}
            zoom={13}
            className="h-full w-full"
            scrollWheelZoom
          >
            <MapLifecycle onReady={setMapInstanceRef} onDispose={clearMapInstanceRef} />
            <TileLayer
              attribution='&copy; OpenStreetMap contributors &copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              subdomains="abcd"
              maxZoom={20}
              detectRetina
            />

            <MapEvents onSelect={applyLocation} />
            <RecenterMap center={mapCenter} hasPinnedLocation={Boolean(activeLocation)} />

            {activeLocation && (
              <Marker
                key={`${activeLocation.lat}-${activeLocation.lng}`}
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
        )}
      </div>

      <div className="rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
        {activeLocation ? (
          <p className="truncate">
            {loadingAddress
              ? "Resolving venue address..."
              : activeLocation.address
                ? `Location confirmed: ${activeLocation.address}`
                : "Location pinned on map. Drag the marker to fine-tune."}
          </p>
        ) : (
          interactiveMapEnabled
            ? "Click on the map to drop a pin and select a location."
            : "Open the interactive map to drop a pin and fine-tune your location."
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
          background: rgba(47, 95, 74, 0.96);
          box-shadow: 0 12px 26px rgba(47, 95, 74, 0.35);
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