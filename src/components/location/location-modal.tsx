"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MapPin, Crosshair } from "lucide-react";
import { useLocationStore } from "@/store/location-store";
import { useLocationSearch } from "@/hooks/use-location-search";
import { useCurrentLocation } from "@/hooks/use-current-location";

interface LocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PlaceResult {
  place_id: string | number;
  display_name: string;
  lat: string | number;
  lon: string | number;
  address?: {
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

export function LocationModal({ open, onOpenChange }: LocationModalProps) {
  const [selectedItem, setSelectedItem] = useState<PlaceResult | null>(null);

  const { setLocation } = useLocationStore();
  const { query, results, loading, search } = useLocationSearch();
  const { getCurrentLocation, loading: geoLoading } = useCurrentLocation();

  async function useMyLocation() {
    const loc = await getCurrentLocation();
    if (!loc) return;

    setLocation({
      address: loc.data.display_name,
      area: loc.data.address.suburb || loc.data.address.neighbourhood || "",
      city:
        loc.data.address.city ||
        loc.data.address.town ||
        loc.data.address.village ||
        "",
      lat: Number(loc.lat),
      lng: Number(loc.lng),
    });

    onOpenChange(false);
  }

  function confirm() {
    if (!selectedItem) return;

    setLocation({
      address: selectedItem.display_name,
      area:
        selectedItem.address?.suburb ||
        selectedItem.address?.neighbourhood ||
        "",
      city:
        selectedItem.address?.city ||
        selectedItem.address?.town ||
        selectedItem.address?.village ||
        "",
      lat: Number(selectedItem.lat),
      lng: Number(selectedItem.lon),
    });

    onOpenChange(false);
  }

  function blockClose(e: Event) {
    e.preventDefault();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) return;
        onOpenChange(true);
      }}
    >
      <div className="px-4">
        <DialogContent
          className="max-w-xl p-0 rounded-2xl overflow-hidden"
          onInteractOutside={blockClose}
          onEscapeKeyDown={blockClose}
          showCloseButton={false}
        >
          <DialogHeader className="p-4 border-b bg-muted/40">
            <DialogTitle className="text-lg">Select Your Location</DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            <Button
              variant="secondary"
              className="w-full flex items-center gap-2"
              onClick={useMyLocation}
              disabled={geoLoading}
            >
              <Crosshair className="h-4 w-4" />
              {geoLoading ? "Detecting..." : "Use My Current Location"}
            </Button>

            <Input
              placeholder="Search for area, street, landmark..."
              value={query}
              onChange={(e) => search(e.target.value)}
            />
          </div>

          <ScrollArea className="h-80 px-4 pb-4">
            {loading && (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin h-6 w-6" />
              </div>
            )}

            {!loading && results.length === 0 && query && (
              <p className="text-center text-muted-foreground py-10">
                No results found
              </p>
            )}

            <div className="space-y-3">
              {results.map((place: PlaceResult) => (
                <button
                  key={place.place_id}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition hover:bg-accent ${
                    selectedItem?.place_id === place.place_id
                      ? "border-primary bg-primary/5"
                      : "border-muted"
                  }`}
                  onClick={() => {
                    setSelectedItem(place);
                    setTimeout(confirm, 150);
                  }}
                >
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{place.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/40 flex justify-end">
            <Button disabled={!selectedItem} onClick={confirm}>
              Confirm Location
            </Button>
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
}
