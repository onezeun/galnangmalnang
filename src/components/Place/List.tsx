'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FiEdit, FiEye, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import { categoryOptions, optionLabels, regionOptions } from '@/config/options';
import { PlaceCategoryType, PlaceListParamsType, PlaceRegionType } from '@/types/places';
import { deletePlaceAction, getPlaceListAction } from '@/actions/place-actions';

const PAGE_SIZE = 10;

export default function PlaceList() {
  // 검색 필터
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>('');
  const [region, setRegion] = useState<string>('');
  const [page, setPage] = useState(0);

  // 필터 파라미터
  const params = useMemo<PlaceListParamsType>(
    () => ({
      keyword,
      category: category as any,
      region: region as any,
      page,
      pageSize: PAGE_SIZE,
    }),
    [keyword, category, region, page]
  );

  const qc = useQueryClient();

  // 목록 조회
  const { data, isLoading } = useQuery({
    queryKey: ['places', params],
    queryFn: async () => {
      const res = await getPlaceListAction(params);
      if (!res.ok) throw new Error(res.message ?? '목록 조회에 실패했습니다.');
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  console.log(data);
  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // 삭제 뮤테이션
  const delMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await deletePlaceAction(id);
      if (!res.ok) throw new Error(res.message ?? '삭제 실패');
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
      {/* 헤더 */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-mitme text-3xl md:text-4xl text-neutral-900">등록된 장소</h1>
        <Link
          href="/admin/place-new"
          className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm"
        >
          <FiPlus size={14} />
          신규 등록
        </Link>
      </div>

      {/* 검색/필터 */}
      <div className="mb-4 rounded-2xl bg-white/80 p-3 shadow-sm border border-neutral-200">
        <div className="grid grid-cols-1 gap-2 md:gap-3 md:grid-cols-3">
          <label className="relative flex items-center">
            <FiSearch className="pointer-events-none absolute left-3 h-4 w-4 text-neutral-400" />
            <input
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
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
            {categoryOptions.map((c) => (
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
            {regionOptions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 로딩 / 빈 상태 */}
      {isLoading && (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-white py-8 text-center text-sm text-neutral-500">
          불러오는 중…
        </div>
      )}
      {!isLoading && rows.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-neutral-200 bg-white py-8 text-center text-sm text-neutral-500">
          데이터가 없습니다.
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <>
          {/* 데스크톱: 테이블 */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-neutral-50 text-neutral-600">
                  <tr>
                    <th className="px-4 py-2 font-medium">이름</th>
                    <th className="px-4 py-2 font-medium">카테고리</th>
                    <th className="px-4 py-2 font-medium">지역</th>
                    <th className="px-4 py-2 text-right font-medium">액션</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-t border-neutral-100 hover:bg-neutral-50/80 transition-colors"
                    >
                      <td className="px-4 py-2 font-medium text-neutral-900">{r.name}</td>
                      <td className="px-4 py-2">
                        {optionLabels.category[r.category as PlaceCategoryType]}
                      </td>
                      <td className="px-4 py-2">
                        {optionLabels.region[r.region as PlaceRegionType]}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 hover:bg-white"
                            href={`/admin/place-edit/${r.id}`}
                          >
                            <FiEdit size={14} /> 편집
                          </Link>
                          <button
                            className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1.5 text-xs text-rose-700 hover:bg-rose-50"
                            onClick={() => handleDelete(r.id)}
                            disabled={delMutation.isPending}
                          >
                            <FiTrash2 size={14} /> 삭제
                          </button>
                          <Link
                            className="inline-flex items-center gap-1 rounded-full border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 hover:bg-white"
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
          </div>

          {/* 모바일: 카드 리스트 */}
          <div className="mt-3 space-y-3 md:hidden">
            {rows.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 shadow-sm"
              >
                {/* 첫 줄: 제목 + 액션 */}
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-neutral-900">{r.name}</div>
                    <div className="mt-2 flex flex-wrap gap-1 text-[11px] text-neutral-600">
                      <span className="inline-flex items-center rounded-full text-brand-600 bg-brand-100 px-2 py-0.5">
                        {optionLabels.category[r.category as PlaceCategoryType]}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5">
                        {optionLabels.region[r.region as PlaceRegionType]}
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/place-edit/${r.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    >
                      <FiEdit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={delMutation.isPending}
                      className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-200 bg-white text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/result/${r.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                    >
                      <FiEye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 페이지네이션 */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-neutral-500">총 {total}건</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="rounded-full border border-neutral-400 bg-white px-3 py-1 disabled:opacity-50"
          >
            이전
          </button>
          <span className="px-2 py-1">
            {page + 1} / {Math.max(1, totalPages)}
          </span>
          <button
            onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
            disabled={page + 1 >= totalPages || isLoading}
            className="rounded-full border border-neutral-400 bg-white px-3 py-1 disabled:opacity-50"
          >
            다음
          </button>
        </div>
      </div>
    </main>
  );
}
