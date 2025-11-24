"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerProps {
    latitude?: number;
    longitude?: number;
    onLocationChange: (lat: number, lng: number, address?: string) => void;
}

function LocationMarker({ position, onPositionChange }: {
    position: [number, number];
    onPositionChange: (lat: number, lng: number) => void;
}) {
    const map = useMapEvents({
        click(e) {
            onPositionChange(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);

    return <Marker position={position} draggable eventHandlers={{
        dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            onPositionChange(position.lat, position.lng);
        },
    }} />;
}

export function LocationPicker({ latitude = 28.6139, longitude = 77.2090, onLocationChange }: LocationPickerProps) {
    const [position, setPosition] = useState<[number, number]>([latitude, longitude]);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (latitude && longitude) {
            setPosition([latitude, longitude]);
        }
    }, [latitude, longitude]);

    const handlePositionChange = async (lat: number, lng: number) => {
        setPosition([lat, lng]);

        // Reverse geocoding to get address
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await response.json();
            const address = data.display_name || "";
            onLocationChange(lat, lng, address);
        } catch (error) {
            console.error("Error fetching address:", error);
            onLocationChange(lat, lng);
        }
    };

    const handleUseMyLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    handlePositionChange(latitude, longitude);
                    toast.success("Location detected successfully");
                },
                (error) => {
                    console.error("Error getting location:", error);
                    toast.error("Unable to get your location. Please enable location services.");
                }
            );
        } else {
            toast.error("Geolocation is not supported by your browser");
        }
    };

    if (!isClient) {
        return (
            <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">Loading map...</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>Click on the map or drag the marker to set your location</span>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleUseMyLocation}
                    className="gap-2"
                >
                    <Navigation className="h-4 w-4" />
                    Use My Location
                </Button>
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden border">
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
                    <LocationMarker position={position} onPositionChange={handlePositionChange} />
                </MapContainer>
            </div>

            <div className="text-xs text-muted-foreground">
                <p>Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}</p>
            </div>
        </div>
    );
}
