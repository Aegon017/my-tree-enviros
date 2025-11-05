"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Location } from "@/types/location.types";

interface LocationState {
  selectedLocation: Location | null;
  locations: Location[];
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  selectedLocation: null,
  locations: [],
  loading: false,
  error: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<Location | null>) => {
      state.selectedLocation = action.payload;
      
      if (typeof window !== "undefined") {
        if (action.payload) {
          localStorage.setItem(
            "selected_location",
            JSON.stringify(action.payload),
          );
        } else {
          localStorage.removeItem("selected_location");
        }
      }
    },
    setLocations: (state, action: PayloadAction<Location[]>) => {
      state.locations = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearSelectedLocation: (state) => {
      state.selectedLocation = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("selected_location");
      }
    },
    syncLocationFromStorage: (state) => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("selected_location");
        if (stored) {
          try {
            state.selectedLocation = JSON.parse(stored);
          } catch {
            state.selectedLocation = null;
          }
        }
      }
    },
  },
});

export const {
  setSelectedLocation,
  setLocations,
  setLoading,
  setError,
  clearSelectedLocation,
  syncLocationFromStorage,
} = locationSlice.actions;

export default locationSlice.reducer;
