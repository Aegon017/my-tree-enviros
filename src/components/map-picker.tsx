"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

import { useLocationSearch } from "@/hooks/use-location-search";

export default function MapPicker({
  position,
  onChange,
}: {
  position: [number, number] | null;
  onChange: (pos: [number, number]) => void;
}) {
  const [MapComponent, setMapComponent] = useState<any>(null);
  const { query, search, results } = useLocationSearch();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const RL = await import("react-leaflet");
      const { MapContainer, TileLayer, Marker, useMapEvents, useMap } = RL;
      const L = await import("leaflet");
      const defaultIcon = L.icon({
        iconUrl: "/marker-icon.png",
        shadowUrl: "/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      });

      function UpdateMapCenter({ pos }: { pos: [number, number] | null }) {
        const map = useMap();
        useEffect(() => {
          if (pos) {
            map.flyTo(pos, 16);
          }
        }, [pos, map]);
        return null;
      }

      function ClickHandler({ onChangeProp }: { onChangeProp: any }) {
        useMapEvents({
          click(e: any) {
            onChangeProp([e.latlng.lat, e.latlng.lng]);
          },
        });
        return null;
      }

      const Combined = ({
        position: pos,
        onChange: oc,
        searchQuery: q,
        onSearch: os,
        searchResults: r,
        onResultSelect: onSelect,
      }: {
        position: any;
        onChange: any;
        searchQuery: string;
        onSearch: (q: string) => void;
        searchResults: any[];
        onResultSelect: (item: any) => void;
      }) => (
        <div className="relative h-full w-full">
          {/* Search Overlay */}
          <div className="absolute top-2 left-2 right-2 z-1001 bg-white rounded-md shadow-md p-2">
            <input
              className="w-full text-sm p-2 border rounded-md outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Search location..."
              value={q}
              onChange={(e) => os(e.target.value)}
            />
            {r.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border max-h-40 overflow-y-auto">
                {r.map((item) => (
                  <div
                    key={item.place_id}
                    className="p-2 text-xs hover:bg-gray-100 cursor-pointer border-b last:border-0"
                    onClick={() => onSelect(item)}
                  >
                    {item.display_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <MapContainer
            className="h-full w-full z-0"
            center={pos || [17.45, 78.38]}
            zoom={15}
            scrollWheelZoom={true}
            style={{ height: 320, width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ClickHandler onChangeProp={oc} />
            <UpdateMapCenter pos={pos} />

            {pos && (
              <Marker
                draggable
                position={pos}
                icon={defaultIcon}
                eventHandlers={{
                  dragend(e: any) {
                    const ll = e.target.getLatLng();
                    oc([ll.lat, ll.lng]);
                  },
                }}
              />
            )}
          </MapContainer>
        </div>
      );

      if (mounted) setMapComponent(() => Combined);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!MapComponent)
    return <div className="h-80 w-full bg-slate-100 rounded animate-pulse" />;

  return (
    <MapComponent
      position={position}
      onChange={onChange}
      searchQuery={query}
      onSearch={search}
      searchResults={results}
      onResultSelect={(item: any) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        onChange([lat, lon]);
        // Clear search is tricky with the hook unless we expose clear method.
        // But clicking result usually means we are done searching.
        // We can just call search("") to clear it?
        search("");
      }}
    />
  );
}
