"use client";

import { create } from "zustand";

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
  setLocation: ( loc: UserGeoLocation ) => void;
  clearLocation: () => void;
  syncFromStorage: () => void;
  setLoading: ( v: boolean ) => void;
  setError: ( msg: string | null ) => void;
}

const STORAGE_KEY = "selected_location";

export const useLocationStore = create<LocationState>( ( set ) => ( {
  selectedLocation: null,
  loading: false,
  error: null,

  setLocation( loc ) {
    set( { selectedLocation: loc } );
    if ( typeof window !== "undefined" ) {
      localStorage.setItem( STORAGE_KEY, JSON.stringify( loc ) );
    }
  },

  clearLocation() {
    set( { selectedLocation: null } );
    if ( typeof window !== "undefined" ) {
      localStorage.removeItem( STORAGE_KEY );
    }
  },

  syncFromStorage() {
    if ( typeof window !== "undefined" ) {
      const raw = localStorage.getItem( STORAGE_KEY );
      if ( raw ) {
        try {
          set( { selectedLocation: JSON.parse( raw ) } );
        } catch {
          set( { selectedLocation: null } );
        }
      }
    }
  },

  setLoading( v ) {
    set( { loading: v } );
  },

  setError( msg ) {
    set( { error: msg } );
  },
} ) );