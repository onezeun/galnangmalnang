export type PlaceCategoryType = 'food' | 'cafe' | 'sight';
export type PlaceRegionType = 'north' | 'south' | 'east' | 'west';

export type PlaceFormValuesType = {
  id?: number;
  name?: string;
  category?: PlaceCategoryType;
  region?: PlaceRegionType;
  description?: string | null;
  address?: string | null;
  hours?: string | null;
  phone?: string | null;
  tags?: string[] | null; // DB에서 text[]로 내려온 걸 그대로
  image_url?: string | null; // 기존 대표 이미지 미리보기용
};

export type PlaceStatusType = 'draft' | 'published' | 'hidden';

export type PlaceRowType = {
  id: number;
  name: string;
  category: PlaceCategoryType; // 'food' | 'cafe' | 'sight'
  region: PlaceRegionType; // 'north' | 'south' | 'east' | 'west'
  status: PlaceStatus;
  address_line1: string | null;
  created_at: string; // ISO
};

export type ListPlacesParamsType = {
  q?: string;
  category?: '' | PlaceCategoryType;
  region?: '' | PlaceRegionType;
  page?: number;
  pageSize?: number;
};

export type ListPlacesResultType = {
  rows: PlaceRow[];
  total: number;
};
