"use client";

import "leaflet/dist/leaflet.css";

import { useCallback, useId, useRef } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { divIcon, type Map as LeafletMap } from "leaflet";

import {
  buildMapLink,
  getLocationDisplay,
  parseJobLocation,
} from "@/app/lib/jobLocation";

type JobLocationPreviewProps = {
  location: unknown;
  className?: string;
};

const markerIcon = divIcon({
  className: "job-location-preview-pin",
  html: '<span class="job-location-preview-pin__outer"><span class="job-location-preview-pin__dot"></span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

const JobLocationPreview = ({ location, className }: JobLocationPreviewProps) => {
  const parsed = parseJobLocation(location);

  const mapMountKey = useId();
  const mapInstanceRef = useRef<LeafletMap | null>(null);

  const setMapInstanceRef = useCallback((map: LeafletMap | null) => {
    mapInstanceRef.current = map;

    if (!map) {
      return;
    }

    // Leaflet throws if map removal happens after another map instance has
    // taken over the same container (_leaflet_id mismatch).
    // Wrap `remove` to avoid crashing the whole page.
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
        // If we can't inspect internals, fall through to original remove.
      }

      try {
        return originalRemove();
      } catch {
        return map;
      }
    };
  }, []);

  if (!parsed) {
    return null;
  }

  const mapLink = buildMapLink(location);
  const label = getLocationDisplay(location);

  return (
    <div className={`w-full min-w-0 ${className ?? ""}`}>
      <div className="h-[220px] w-full overflow-hidden rounded-lg border border-gray-200">
        <MapContainer
          key={mapMountKey}
          center={{ lat: parsed.lat, lng: parsed.lng }}
          zoom={14}
          className="h-full w-full"
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
          zoomControl={false}
          ref={setMapInstanceRef}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={20}
            detectRetina
          />
          <Marker
            position={{ lat: parsed.lat, lng: parsed.lng }}
            icon={markerIcon}
          />
        </MapContainer>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
        <p className="min-w-0 break-words text-sm leading-6 text-gray-600">{label}</p>
        <a
          href={mapLink}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-w-[110px] shrink-0 items-center justify-center whitespace-nowrap rounded-md border border-primary-500 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50"
        >
          View on Map
        </a>
      </div>

      <style jsx global>{`
        .job-location-preview-pin__dot {
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

        .job-location-preview-pin__outer {
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

        .job-location-preview-pin__dot::after {
          content: "";
          position: absolute;
          left: -2px;
          top: -2px;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.35);
        }
      `}</style>
    </div>
  );
};

export default JobLocationPreview;