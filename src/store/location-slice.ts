"use client";

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UserGeoLocation {
  lat: number;
  lng: number;
  area: string;
  city: string;
  postal_code: string;
  post_office_name: string;
  post_office_branch_type?: string;
}

interface LocationState {
  selectedLocation: UserGeoLocation | null;
  loading: boolean;
  error: string | null;
}

const initialState: LocationState = {
  selectedLocation: null,
  loading: false,
  error: null,
};

const slice = createSlice( {
  name: "location",
  initialState,
  reducers: {
    setSelectedLocation: ( state, action: PayloadAction<UserGeoLocation | null> ) => {
      state.selectedLocation = action.payload;
      if ( typeof window !== "undefined" ) {
        if ( action.payload ) {
          localStorage.setItem( "selected_location", JSON.stringify( action.payload ) );
        } else {
          localStorage.removeItem( "selected_location" );
        }
      }
    },
    setLoading: ( state, action: PayloadAction<boolean> ) => {
      state.loading = action.payload;
    },
    setError: ( state, action: PayloadAction<string | null> ) => {
      state.error = action.payload;
    },
    clearSelectedLocation: ( state ) => {
      state.selectedLocation = null;
      if ( typeof window !== "undefined" ) {
        localStorage.removeItem( "selected_location" );
      }
    },
    syncLocationFromStorage: ( state ) => {
      if ( typeof window !== "undefined" ) {
        const stored = localStorage.getItem( "selected_location" );
        if ( stored ) {
          try {
            state.selectedLocation = JSON.parse( stored );
          } catch {
            state.selectedLocation = null;
          }
        }
      }
    },
  },
} );

export const {
  setSelectedLocation,
  setLoading,
  setError,
  clearSelectedLocation,
  syncLocationFromStorage,
} = slice.actions;

export default slice.reducer;