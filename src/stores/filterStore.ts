'use client';

import { create } from 'zustand';
import { PlaceCategoryType, PlaceRegionType } from '@/types/places';

type LocStatus = 'idle' | 'getting' | 'ok' | 'denied' | 'error';

type FilterState = {
  region: PlaceRegionType;
  category: PlaceCategoryType;
  lat: string | null;
  lng: string | null;
  radius: string;
  locStatus: LocStatus;

  // actions
  setRegion: (v: PlaceRegionType) => void;
  setCategory: (v: PlaceCategoryType) => void;
  setLocation: (lat: string | null, lng: string | null) => void;
  setRadius: (r: string) => void;
  setLocStatus: (s: LocStatus) => void;
  resetNearby: () => void;
};

export const useFilterStore = create<FilterState>((set, get) => ({
  region: 'all',
  category: 'all',
  lat: null,
  lng: null,
  radius: '2000',
  locStatus: 'idle',

  setRegion: (v) => set({ region: v }),
  setCategory: (v) => set({ category: v }),
  setLocation: (lat, lng) => set({ lat, lng }),
  setRadius: (r) => set({ radius: r }),
  setLocStatus: (s) => set({ locStatus: s }),
  resetNearby: () => set({ lat: null, lng: null, radius: '2000', locStatus: 'idle' }),
}));
