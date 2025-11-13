'use client';

import { create } from 'zustand';
import { PlaceCategoryType, PlaceRegionType } from '@/types/places';

type FilterState = {
  region: PlaceRegionType;
  category: PlaceCategoryType;
  lat: number | null;
  lng: number | null;
  radius: number;

  // actions
  setRegion: (v: PlaceRegionType) => void;
  setCategory: (v: PlaceCategoryType) => void;
  setLocation: (lat: number | null, lng: number | null) => void;
  setRadius: (r: number) => void;
  resetNearby: () => void;
};

export const useFilterStore = create<FilterState>((set, get) => ({
  region: 'all',
  category: 'all',
  lat: null,
  lng: null,
  radius: 2000,

  setRegion: (v) => set({ region: v }),
  setCategory: (v) => set({ category: v }),
  setLocation: (lat, lng) => set({ lat, lng }),
  setRadius: (r) => set({ radius: r }),
  resetNearby: () => set({ lat: null, lng: null, radius: 2000 }),
}));
