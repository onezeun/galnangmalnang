export type PlaceCategoryType = 'all' | 'food' | 'cafe' | 'sight';
export type PlaceRegionType = 'all' | 'nearby' | 'north' | 'south' | 'east' | 'west';
export type PlaceStatusType = 'draft' | 'published' | 'hidden';

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

export type PlaceRowType = {
  id: number;
  name: string;
  category: PlaceCategoryType; // 'all' | 'food' | 'cafe' | 'sight'
  region: PlaceRegionType; // 'all' | 'nearby' | 'north' | 'south' | 'east' | 'west'
  status: PlaceStatus;
  address_line1: string | null;
  created_at: string; // ISO
};

export type PlaceListParamsType = {
  q?: string;
  category?: '' | PlaceCategoryType;
  region?: '' | PlaceRegionType;
  page?: number;
  pageSize?: number;
};