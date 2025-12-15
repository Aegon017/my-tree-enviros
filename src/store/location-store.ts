import { create } from "zustand";

export type LocationData = {
  address: string;
  area: string;
  city: string;
  lat: number;
  lng: number;
};

type LocationState = {
  selected: LocationData | null;
  hydrated: boolean;
  setLocation: (loc: LocationData) => void;
  clear: () => void;
  sync: () => void;
};

export const useLocationStore = create<LocationState>((set) => ({
  selected: null,
  hydrated: false,
  setLocation: (loc) => {
    localStorage.setItem("mte_location", JSON.stringify(loc));
    set({ selected: loc });
  },
  clear: () => {
    localStorage.removeItem("mte_location");
    set({ selected: null });
  },
  sync: () => {
    const raw = localStorage.getItem("mte_location");
    if (raw) set({ selected: JSON.parse(raw) });
    set({ hydrated: true });
  },
}));
