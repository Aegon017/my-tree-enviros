"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MapPin, Check, Search, X } from "lucide-react";
import { useLocationStore } from "@/store/location-store";
import { useLocationSearch } from "@/hooks/use-location-search";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

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
  const { selected: currentSelected, setLocation: saveLocation } = useLocationStore();
  const { query, results, loading, search } = useLocationSearch();

  function onSelect(item: PlaceResult) {
    saveLocation({
      address: item.display_name,
      area:
        item.address?.suburb ||
        item.address?.neighbourhood ||
        "",
      city:
        item.address?.city ||
        item.address?.town ||
        item.address?.village ||
        "",
      lat: Number(item.lat),
      lng: Number(item.lon),
    });
    onOpenChange(false);
  }

  function blockClose(e: Event) {
    // Only block close if we don't have a location yet (forced selection)
    if (!currentSelected) {
      e.preventDefault();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !currentSelected) return; // Prevent closing if nothing selected
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="max-w-md w-[90%] rounded-2xl p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl duration-300 z-200"
        onInteractOutside={blockClose}
        onEscapeKeyDown={blockClose}
        showCloseButton={!!currentSelected}
      >
        <VisuallyHidden>
          <DialogTitle>Select Location</DialogTitle>
        </VisuallyHidden>

        {/* Header / Search Area */}
        <div className="p-4 md:p-6 border-b border-border/40 bg-muted/30">
          <h2 className="text-lg font-semibold tracking-tight mb-4 flex items-center gap-2">
            <span className="text-primary">
              <MapPin className="fill-primary text-primary-foreground h-6 w-6 p-1 rounded-full bg-primary" />
            </span>
            <span>Set location</span>
          </h2>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search for area, street name..."
              className="pl-9 h-12 text-base bg-background shadow-sm border-muted-foreground/20 focus-visible:ring-primary/20 transition-all rounded-xl"
              value={query}
              onChange={(e) => search(e.target.value)}
              autoFocus={true}
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px]">
          <div className="p-2">

            {/* Current Location Indicator */}
            {currentSelected && !query && (
              <div className="mb-2">
                <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Current Location
                </div>
                <div className="mx-2 p-3 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                  <div className="mt-1 min-w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Check className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">
                      {currentSelected.area || currentSelected.city}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {currentSelected.address}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {query && results.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Search className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No locations found</p>
                <p className="text-xs text-muted-foreground mt-1">Try searching for a city or area name</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="flex flex-col gap-1">
                {query && (
                  <div className="px-4 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Search Results
                  </div>
                )}
                {results.map((place: PlaceResult) => (
                  <button
                    key={place.place_id}
                    className="w-full text-left px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors flex items-start gap-3 group"
                    onClick={() => onSelect(place)}
                  >
                    <div className="mt-0.5 min-w-8 h-8 rounded-full bg-muted group-hover:bg-background border border-transparent group-hover:border-border flex items-center justify-center transition-colors">
                      <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">
                        {place.display_name.split(",")[0]}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {place.display_name}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!query && !currentSelected && results.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4 opacity-50">
                <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm">Start typing to find your location</p>
              </div>
            )}

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
