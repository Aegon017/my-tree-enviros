"use client";

import { useEffect } from "react";
import { LocationSelectionModal } from "./location-selection-modal";
import { useLocation } from "@/hooks/use-location";

/**
 * LocationProvider wraps the app and handles:
 * - Initial location sync from storage
 * - Showing location selection modal on first visit
 * - Loading locations from API
 */
export function LocationProvider({ children }: { children: React.ReactNode }) {
  const { syncFromStorage, fetchRootLocations } = useLocation();

  useEffect(() => {
    // Sync location from localStorage on mount
    syncFromStorage();

    // Pre-fetch available locations
    fetchRootLocations();
  }, [syncFromStorage, fetchRootLocations]);

  return (
    <>
      <LocationSelectionModal />
      {children}
    </>
  );
}
