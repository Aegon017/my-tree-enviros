"use client";

import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";

import {
  setSelectedLocation,
  clearSelectedLocation,
  syncLocationFromStorage,
  setLoading,
  setError,
} from "@/store/location-slice";

import type { UserGeoLocation } from "@/store/location-slice";

export function useLocation() {
  const dispatch = useDispatch();
  const { selectedLocation, loading, error } = useSelector(
    (state: RootState) => state.location
  );

  const setLocation = useCallback(
    (geo: UserGeoLocation) => {
      dispatch(setSelectedLocation(geo));
    },
    [dispatch]
  );

  const clearLocation = useCallback(() => {
    dispatch(clearSelectedLocation());
  }, [dispatch]);

  const syncFromStorageSafe = useCallback(() => {
    dispatch(syncLocationFromStorage());
  }, [dispatch]);

  const setLoadingState = useCallback(
    (v: boolean) => dispatch(setLoading(v)),
    [dispatch]
  );

  const setErrorState = useCallback(
    (msg: string | null) => dispatch(setError(msg)),
    [dispatch]
  );

  return {
    selectedLocation,
    loading,
    error,
    setLocation,
    clearLocation,
    syncFromStorage: syncFromStorageSafe,
    setLoadingState,
    setErrorState,
  };
}