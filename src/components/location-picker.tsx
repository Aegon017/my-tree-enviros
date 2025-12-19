import { reverseGeocode } from "@/lib/apiAddress";
import MapPicker from "@/components/map-picker";
import { useLocationStore } from "@/store/location-store";
import { useEffect, useState, useRef } from "react";
import { MapPin, Navigation } from "lucide-react";

export interface LocationDetails {
  area: string;
  city: string;
  postal_code: string;
  street: string;
}

interface LocationPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationChange: (lat: number, lng: number, address?: string, details?: LocationDetails) => void;
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

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const lastFetched = useRef<string | null>(null);

  const handlePositionChange = async (lat: number, lng: number) => {
    // Prevent duplicate fetches for same coord (stops infinite loops)
    const key = `${lat}-${lng}`;
    if (lastFetched.current === key) {
      // Just update local position UI if needed, but don't re-trigger parent/API
      setPosition([lat, lng]);
      return;
    }
    lastFetched.current = key;

    setPosition([lat, lng]);

    try {
      const data = await reverseGeocode(lat, lng);
      // We want the display name for the address?
      // apiAddress returns structured data (area, city, etc).
      // But LocationPicker prop expects "address" string.
      // Let's construct a nice address string or pass the structured one?
      // The prop is `onLocationChange(lat, lng, address?: string)`

      const parts = [
        data.street,
        data.area,
        data.city,
        data.postal_code
      ].filter(Boolean).join(", ");

      onLocationChange(lat, lng, parts, {
        area: data.area || "",
        city: data.city || "",
        postal_code: data.postal_code || "",
        street: data.street || "",
      });
    } catch (error) {
      console.error("Error fetching address:", error);
      onLocationChange(lat, lng);
    }
  };

  const { selected } = useLocationStore();

  useEffect(() => {
    if (latitude && longitude && (latitude !== 28.6139 || longitude !== 77.209)) {
      return;
    }

    if (selected?.lat && selected?.lng) {
      handlePositionChange(selected.lat, selected.lng);
    } else {
      handleUseMyLocation();
    }
  }, []);

  const handleUseMyLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handlePositionChange(latitude, longitude);
        },
        (error) => {
          console.warn("Error getting location:", error);
        },
      );
    }
  };

  if (!isClient) {
    return (
      <div className="h-[320px] bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>Click map or drag marker to pin location</span>
        </div>
      </div>

      <div className="h-[320px] rounded-lg overflow-hidden border">
        <MapPicker
          position={position}
          onChange={([lat, lng]) => handlePositionChange(lat, lng)}
        />
      </div>
    </div>
  );
}
