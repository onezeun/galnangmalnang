export const regionOptions = [
  { value: 'all', label: '전체' },
  { value: 'nearby', label: '현재위치근처' },
  { value: 'north', label: '제주시/북부' },
  { value: 'south', label: '서귀포/남부' },
  { value: 'east', label: '동부' },
  { value: 'west', label: '서부' },
] as const;

export const categoryOptions = [
  { value: 'all', label: '전체' },
  { value: 'food', label: '음식점' },
  { value: 'cafe', label: '카페' },
  { value: 'sight', label: '관광지' },
] as const;

export const statusOptions = [
  { value: 'draft', label: '임시저장' },
  { value: 'published', label: '공개' },
  { value: 'hidden', label: '숨김' },
] as const;

export const optionLabels = {
  region: {
    all: '전체',
    nearby: '현재위치근처',
    north: '제주시/북부',
    south: '서귀포/남부',
    east: '동부',
    west: '서부',
  },
  category: { all: '전체', food: '음식점', cafe: '카페', sight: '관광지' },
  status: { draft: '임시저장', published: '공개', hidden: '숨김' },
} as const;