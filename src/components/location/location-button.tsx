"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { useLocationStore } from "@/store/location-store";
import { LocationModal } from "@/components/location/location-modal";
import { cn } from "@/lib/utils";
import { useCurrentLocation } from "@/hooks/use-current-location";

export function LocationButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const { selected, sync, hydrated } = useLocationStore();
  const { getCurrentLocation } = useCurrentLocation();

  useSWR(
    "location-sync",
    async () => {
      sync();
      await getCurrentLocation();
      return localStorage.getItem("mte_location");
    },
    {
      revalidateOnFocus: true,
    }
  );

  useEffect(() => {
    sync();
  }, [sync]);

  const label = selected
    ? `${selected.area || selected.city}, ${selected.city}`
    : "Select Location";

  return (
    <>
      <Button
        variant="ghost"
        className={cn(
          "p-0 h-auto text-sm font-medium flex items-center hover:text-primary",
          className
        )}
        onClick={() => setOpen(true)}
      >
        <MapPin className="h-5 w-5 mr-1 text-primary" />
        <span className="max-w-full md:max-w-[200px] truncate block">
          {label}
        </span>
      </Button>


      <LocationModal open={open} onOpenChange={setOpen} />
    </>
  );
}
