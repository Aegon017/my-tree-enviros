"use client";

import { useEffect, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "@/hooks/use-location";
import { cn } from "@/lib/utils";
import type { Location } from "@/types/location.types";

export function LocationSelectionModal() {
  const {
    selectedLocation,
    locations,
    loading,
    selectLocation,
    fetchRootLocations,
    syncFromStorage,
  } = useLocation();

  const [open, setOpen] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  // Check if user has previously selected a location
  useEffect(() => {
    if (!hasCheckedStorage) {
      syncFromStorage();
      setHasCheckedStorage(true);
    }
  }, [hasCheckedStorage, syncFromStorage]);

  // Show modal if no location is selected after checking storage
  useEffect(() => {
    if (hasCheckedStorage && !selectedLocation) {
      setOpen(true);
      if (locations.length === 0) {
        fetchRootLocations();
      }
    }
  }, [hasCheckedStorage, selectedLocation, locations.length, fetchRootLocations]);

  const handleLocationSelect = (location: Location) => {
    selectLocation(location);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <MapPin className="h-6 w-6 text-primary" />
            Select Your Location
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose your city to see available trees and services in your area
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">
                Loading locations...
              </p>
            </div>
          ) : locations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                No locations available at the moment.
                <br />
                Please try again later.
              </p>
              <Button
                onClick={fetchRootLocations}
                variant="outline"
                size="sm"
              >
                Retry
              </Button>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {locations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg border-2 transition-all",
                      "hover:border-primary hover:bg-primary/5",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "group"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-base">
                            {location.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            View available trees
                          </p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-6 w-6 rounded-full border-2 border-primary flex items-center justify-center">
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            You can change your location anytime from the header
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
