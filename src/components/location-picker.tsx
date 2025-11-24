"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { toast } from "sonner";

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
}

export function LocationPicker({
  latitude = 28.6139,
  longitude = 77.209,
  onLocationChange,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    latitude,
    longitude,
  ]);
  const [isClient, setIsClient] = useState(false);

  function InlineMap({
    position,
    onPositionChange,
  }: {
    position: [number, number];
    onPositionChange: (lat: number, lng: number) => void;
  }) {
    const handleClick = (e: any) => {
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const lng = position[1] + (x / rect.width - 0.5) * 0.1;
      const lat = position[0] - (y / rect.height - 0.5) * 0.1;
      onPositionChange(lat, lng);
    };

    return (
      <div
        className="h-full w-full bg-linear-to-br from-slate-100 to-white flex items-center justify-center text-sm text-muted-foreground cursor-pointer"
        onClick={handleClick}
      >
        <div className="text-center">
          <div>Click anywhere to set location</div>
          <div className="mt-2">
            Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
          </div>
        </div>
      </div>
    );
  }

  const ClientMap = dynamic(() => Promise.resolve({ default: InlineMap }), {
    ssr: false,
  });

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

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
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
          toast.error(
            "Unable to get your location. Please enable location services.",
          );
        },
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
        <ClientMap
          position={position}
          onPositionChange={handlePositionChange}
        />
      </div>

      <div className="text-xs text-muted-foreground">
        <p>
          Coordinates: {position[0].toFixed(6)}, {position[1].toFixed(6)}
        </p>
      </div>
    </div>
  );
}
