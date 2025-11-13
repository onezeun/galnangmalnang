export type PlaceCategoryType = 'all' | 'food' | 'cafe' | 'sight';
export type PlaceRegionType = 'all' | 'nearby' | 'north' | 'south' | 'east' | 'west';
export type PlaceStatusType = 'draft' | 'published' | 'hidden';

/** 공통 타입 */
export type PlaceBaseType = {
  id: number;
  name: string;
  category: string;
  region: string;
  status: string | null;
  address_line1: string | null;
};

/** 목록(리스트)용 타입 — 화면 테이블용 */
export type PlaceListRowType = PlaceBaseType;

/** 상세 페이지용 타입 — 상세 정보 전부 포함 */
export type PlaceRowType = PlaceBaseType & {
  description?: string | null;
  phone?: string | null;
  tags?: string[] | null;
  image_url?: string | null;
  hours?: string | null;
};

export type PlaceFormValuesType = {
  id?: number;
  name: string;
  category: PlaceCategoryType;
  region: PlaceRegionType;
  description?: string | null;
  address?: string | null;
  hours?: string | null;
  phone?: string | null;
  tags?: string[] | null; // DB에서 text[]로 내려온 걸 그대로
  image_url?: string | null; // 기존 대표 이미지 미리보기용
};

export type PlaceListParamsType = {
  q?: string;
  category?: '' | PlaceCategoryType;
  region?: '' | PlaceRegionType;
  page?: number;
  pageSize?: number;
};
