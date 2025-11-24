"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapPicker({
  position,
  onChange,
}: {
  position: [number, number] | null;
  onChange: (pos: [number, number]) => void;
}) {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const RL = await import("react-leaflet");
      const { MapContainer, TileLayer, Marker, useMapEvents } = RL;

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
      }: {
        position: any;
        onChange: any;
      }) => (
        <MapContainer
          className="rounded-md overflow-hidden"
          center={pos || [17.45, 78.38]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: 320, width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ClickHandler onChangeProp={oc} />

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
      );

      if (mounted) setMapComponent(() => Combined);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!MapComponent)
    return <div className="h-80 w-full bg-slate-100 rounded animate-pulse" />;

  return <MapComponent position={position} onChange={onChange} />;
}
