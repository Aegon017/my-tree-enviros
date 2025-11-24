"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default icon paths for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function LocationMarker({ position, onPositionChange }: { position: [number, number]; onPositionChange: (lat: number, lng: number) => void; }) {
    const map = useMapEvents({
        click(e: any) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        if (map && position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);

    return (
        <Marker position={position} draggable eventHandlers={{
            dragend: (e: any) => {
                const marker = e.target;
                const pos = marker.getLatLng();
                onPositionChange(pos.lat, pos.lng);
            },
        }} />
    );
}

export default function LocationPickerMap({ position, onPositionChange }: { position: [number, number]; onPositionChange: (lat: number, lng: number) => void; }) {
    return (
        <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} onPositionChange={onPositionChange} />
        </MapContainer>
    );
}
