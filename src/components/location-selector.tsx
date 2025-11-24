"use client";

import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation } from "@/hooks/use-location-search";
import { LocationModal } from "@/components/location/location-modal";

export default function LocationSelector() {
  const { selectedLocation, syncFromStorage } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    syncFromStorage();
  }, [syncFromStorage]);

  return (
    <>
      <Button
        variant="ghost"
        onClick={() => setOpen(true)}
        className="p-0 h-auto font-normal text-muted-foreground"
      >
        <MapPin className="w-3 h-3 mr-1" />
        <span className="truncate max-w-[100px]">
          {selectedLocation?.area ||
            selectedLocation?.city ||
            "Select Location"}
        </span>
      </Button>

      <LocationModal open={open} onOpenChange={setOpen} />
    </>
  );
}
