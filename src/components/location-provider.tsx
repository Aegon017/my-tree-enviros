"use client";

import { useEffect, useState } from "react";
import { LocationModal } from "./location/location-modal";
import { useLocation } from "@/hooks/use-location-search";
import { useCurrentLocation } from "@/hooks/use-current-location";
import { useLocationStore } from "@/store/location-store";
import { toast } from "sonner";


export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { syncFromStorage } = useLocation();
  const selected = useLocationStore((state) => state.selected);
  const { getCurrentLocation } = useCurrentLocation();
  const [init, setInit] = useState(false);

  useEffect(() => {
    syncFromStorage();
    setInit(true);
  }, [syncFromStorage]);

  useEffect(() => {
    if (!init) return;

    // If we have a selected location (from storage), stop detecting
    if (selected) {
      useLocationStore.getState().setDetecting(false);
      return;
    }

    (async () => {
      try {
        const current = await getCurrentLocation();
        if (current) {
          useLocationStore.getState().setLocation({
            address: [current.data.street, current.data.area, current.data.city, current.data.postal_code].filter(Boolean).join(", "),
            area: current.data.area || "",
            city: current.data.city || "",
            lat: Number(current.lat),
            lng: Number(current.lng),
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        useLocationStore.getState().setDetecting(false);
      }
    })();
  }, [init, selected, getCurrentLocation]);

  const detecting = useLocationStore((s) => s.detecting);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!selected && !detecting) {
      setOpen(true);
    }
  }, [selected, detecting]);

  return (
    <>
      <LocationModal open={open} onOpenChange={setOpen} />
      {children}
    </>
  );
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  var R = 6371;
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}
