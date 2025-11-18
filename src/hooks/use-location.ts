"use client";

import { useLocationStore } from "@/store/location-store";


export function useLocation() {
  const selectedLocation = useLocationStore( ( s ) => s.selectedLocation );
  const loading = useLocationStore( ( s ) => s.loading );
  const error = useLocationStore( ( s ) => s.error );

  const setLocation = useLocationStore( ( s ) => s.setLocation );
  const clearLocation = useLocationStore( ( s ) => s.clearLocation );
  const syncFromStorage = useLocationStore( ( s ) => s.syncFromStorage );
  const setLoadingState = useLocationStore( ( s ) => s.setLoading );
  const setErrorState = useLocationStore( ( s ) => s.setError );

  return {
    selectedLocation,
    loading,
    error,
    setLocation,
    clearLocation,
    syncFromStorage,
    setLoadingState,
    setErrorState,
  };
}