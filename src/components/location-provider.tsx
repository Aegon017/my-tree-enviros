"use client";

import { useEffect } from "react";
import { LocationSelectionModal } from "./location-selection-modal";
import { useLocation } from "@/hooks/use-location";


export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { syncFromStorage, fetchRootLocations } = useLocation();

  useEffect(() => {
    
    syncFromStorage();

    
    fetchRootLocations();
  }, [syncFromStorage, fetchRootLocations]);

  return (
    <>
      <LocationSelectionModal />
      {children}
    </>
  );
}
