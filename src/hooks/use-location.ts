"use client";

import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  setSelectedLocation,
  setLocations,
  setLoading,
  setError,
  clearSelectedLocation,
  syncLocationFromStorage,
} from "@/store/location-slice";
import type { Location } from "@/types/location.types";
import { locationService } from "@/services/location.service";

export function useLocation() {
  const dispatch = useDispatch();
  const { selectedLocation, locations, loading, error } = useSelector(
    (state: RootState) => state.location,
  );

  /**
   * Select a location and persist it
   */
  const selectLocation = useCallback(
    (location: Location | null) => {
      dispatch(setSelectedLocation(location));
    },
    [dispatch],
  );

  /**
   * Clear selected location
   */
  const clearLocation = useCallback(() => {
    dispatch(clearSelectedLocation());
  }, [dispatch]);

  /**
   * Fetch all root locations
   */
  const fetchRootLocations = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));
      const response = await locationService.getRoot();
      if (response.success && response.data.locations) {
        dispatch(setLocations(response.data.locations));
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch locations";
      dispatch(setError(errorMessage));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  /**
   * Fetch all locations with optional filters
   */
  const fetchLocations = useCallback(
    async (params?: {
      parent_id?: number | null;
      with_children?: boolean;
      with_parent?: boolean;
    }) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const response = await locationService.getAll(params);
        if (response.success && response.data.locations) {
          dispatch(setLocations(response.data.locations));
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch locations";
        dispatch(setError(errorMessage));
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  /**
   * Sync location from localStorage on mount
   */
  const syncFromStorage = useCallback(() => {
    dispatch(syncLocationFromStorage());
  }, [dispatch]);

  /**
   * Get location by ID
   */
  const getLocationById = useCallback(
    async (id: number) => {
      try {
        dispatch(setLoading(true));
        dispatch(setError(null));
        const response = await locationService.getById(id, {
          with_parent: true,
          with_children: true,
        });
        if (response.success && response.data.location) {
          return response.data.location;
        }
        return null;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch location";
        dispatch(setError(errorMessage));
        return null;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  /**
   * Get tree count for selected location
   */
  const getTreeCount = useCallback(async (locationId: number) => {
    try {
      const response = await locationService.getTreeCount(locationId);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      console.error("Failed to fetch tree count:", err);
      return null;
    }
  }, []);

  return {
    selectedLocation,
    locations,
    loading,
    error,
    selectLocation,
    clearLocation,
    fetchRootLocations,
    fetchLocations,
    syncFromStorage,
    getLocationById,
    getTreeCount,
  };
}
