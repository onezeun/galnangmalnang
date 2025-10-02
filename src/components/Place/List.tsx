'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { FiEye, FiEdit, FiTrash2, FiSearch, FiPlus } from 'react-icons/fi';
import { getPlaceListAction, deletePlaceAction } from '@/actions/place-actions';
import {
  PlaceCategoryType,
  PlaceRegionType,
  PlaceStatusType,
  PlaceRowType,
  ListPlacesParamsType,
  ListPlacesResultType,
} from '@/types/places';

type Place = {
  id: number;
  name: string;
  category: PlaceCategoryType;
  region: PlaceRegionType;
  status: PlaceStatusType;
  address_line1: string | null;
  created_at: string;
};

const categories = [
  { value: '', label: '전체' },
  { value: 'food', label: '음식점' },
  { value: 'cafe', label: '카페' },
  { value: 'sight', label: '관광지' },
] as const;

const regions = [
  { value: '', label: '전체' },
  { value: 'north', label: '제주시/북부' },
  { value: 'south', label: '서귀포/남부' },
  { value: 'east', label: '동부' },
  { value: 'west', label: '서부' },
] as const;

const CATEGORY_LABEL: Record<PlaceCategoryType, string> = {
  food: '음식점',
  cafe: '카페',
  sight: '관광지',
};
const REGION_LABEL: Record<PlaceRegionType, string> = {
  north: '제주시/북부',
  south: '서귀포/남부',
  east: '동부',
  west: '서부',
};
const STATUS_LABEL: Record<PlaceStatusType, string> = {
  draft: '임시저장',
  published: '공개',
  hidden: '숨김',
};

const PAGE_SIZE = 10;

export default function PlaceList() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [page, setPage] = useState(0);

  const params = useMemo<ListPlacesParamsType>(
    () => ({ q, category: category as any, region: region as any, page, pageSize: PAGE_SIZE }),
    [q, category, region, page]
  );

  const qc = useQueryClient();

  // 목록 조회
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['places', params],
    queryFn: () => getPlaceListAction(params),
    placeholderData: (prev) => prev,
  });

  const rows = (data?.rows ?? []) as Place[];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // 삭제 뮤테이션
  const delMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deletePlaceAction(id);
      if (!res.ok) throw new Error(res.msg || '삭제 실패');
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['places'] });
    },
  });

  async function handleDelete(id: number) {
    if (!confirm('정말 삭제할까요?')) return;
    delMutation.mutate(id);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mitme text-4xl text-neutral-900">등록된 장소</h1>
        <Link
          href="/admin/place-new"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold text-white"
        >
          <FiPlus size={14} />
          신규 등록
        </Link>
      </div>

      {/* 검색/필터 */}
      <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="relative flex items-center">
          <FiSearch className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
            placeholder="이름 검색"
            className="ring-brand-500 w-full rounded-md border border-neutral-300 bg-white px-9 py-2 text-sm outline-none focus:ring-2"
          />
        </label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(0);
          }}
          className="ring-brand-500 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
        >
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setPage(0);
          }}
          className="ring-brand-500 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2"
        >
          {regions.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* 테이블 */}
      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 text-neutral-600">
            <tr>
              <th className="px-4 py-2">이름</th>
              <th className="px-4 py-2">카테고리</th>
              <th className="px-4 py-2">지역</th>
              <th className="px-4 py-2 text-right">액션</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
                  불러오는 중…
                </td>
              </tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
                  데이터가 없습니다.
                </td>
              </tr>
            )}
            {!isLoading &&
              rows.map((r) => (
                <tr key={r.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2 font-medium text-neutral-900">{r.name}</td>
                  <td className="px-4 py-2">{CATEGORY_LABEL[r.category]}</td>
                  <td className="px-4 py-2">{REGION_LABEL[r.region]}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-white"
                        href={`/admin/place-edit/${r.id}`}
                      >
                        <FiEdit size={14} /> 편집
                      </Link>
                      <button
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
                        onClick={() => handleDelete(r.id)}
                        disabled={delMutation.isPending}
                      >
                        <FiTrash2 size={14} /> 삭제
                      </button>
                      <Link
                        className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-white"
                        href={`/result/${r.id}`}
                      >
                        <FiEye size={14} /> 보기
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-neutral-500">총 {total}건</span>
        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="rounded-md border border-neutral-400 bg-white px-3 py-1 disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-2 py-1">
            {page + 1} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
            disabled={page + 1 >= totalPages || isLoading}
            className="rounded-md border border-neutral-400 bg-white px-3 py-1 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </main>
  );
}
