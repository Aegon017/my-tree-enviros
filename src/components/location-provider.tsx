"use client";

import { useEffect } from "react";
import { LocationSelectionModal } from "./location-selection-modal";
import { useLocation } from "@/hooks/use-location-search";

export function LocationProvider( { children }: { children: React.ReactNode } ) {
  const { syncFromStorage } = useLocation();

  useEffect( () => {
    syncFromStorage();
  }, [ syncFromStorage ] );

  return (
    <>
      <LocationSelectionModal />
      { children }
    </>
  );
}