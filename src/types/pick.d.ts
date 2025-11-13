// region: 'all' | 'nearby' | 'north' | 'south' | 'east' | 'west';
// category: 'all' | 'food' | 'cafe' | 'sight';

export type PickPlacePayloadType = {
  region: string;
  category: string;
  lat?: number | null;
  lng?: number | null;
  radius?: number | null;
};
