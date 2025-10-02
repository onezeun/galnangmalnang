'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { FiUploadCloud as LuUploadCloud, FiImage as LuImage } from 'react-icons/fi';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createPlaceAction, updatePlaceAction, getPlaceByIdAction } from '@/actions/place-actions';
import type { PlaceCategoryType, PlaceRegionType, PlaceFormValuesType } from '@/types/places';

type Props = {
  mode: 'create' | 'edit';
  id?: number; // edit 모드일 때만 사용
};

export const categories = [
  { value: 'food', label: '음식점' },
  { value: 'cafe', label: '카페' },
  { value: 'sight', label: '관광지' },
] as const;

export const regions = [
  { value: 'north', label: '제주시/북부' },
  { value: 'south', label: '서귀포/남부' },
  { value: 'east', label: '동부' },
  { value: 'west', label: '서부' },
] as const;

export default function PlaceForm({ mode, id }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const qc = useQueryClient();

  // 상세 불러오기 (edit + id 있을 때만)
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['place', id],
    queryFn: async () => {
      if (!(mode === 'edit' && typeof id === 'number')) return undefined;
      const row = await getPlaceByIdAction(id);
      if (!row) throw new Error('대상을 찾을 수 없습니다.');
      return row;
    },
    enabled: mode === 'edit' && typeof id === 'number',
  });

  // 미리보기: 파일이 선택되면 파일 미리보기, 아니면 불러온 image_url
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (mode === 'edit' && data?.image_url) {
      setPreview(data.image_url);
    } else {
      setPreview(null);
    }
  }, [file, mode, data?.image_url]);

  const errors = useMemo(() => [] as string[], []);

  const mutation = useMutation({
    mutationFn: async (fd: FormData) => {
      const res = mode === 'edit' ? await updatePlaceAction(fd) : await createPlaceAction(fd);
      if (!res.ok) throw new Error(res.msg);
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['places'] });
      if (mode === 'edit' && typeof id === 'number') {
        qc.invalidateQueries({ queryKey: ['place', id] });
      }
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setToast(null);

    const form = e.currentTarget;
    if (errors.length) {
      setToast({ ok: false, msg: errors[0] });
      return;
    }

    const fd = new FormData(form);
    if (file) fd.set('image', file);

    // edit 모드면 id 보장 주입
    if (mode === 'edit' && typeof id === 'number' && !fd.get('id')) {
      fd.set('id', String(id));
    }

    mutation.mutate(fd, {
      onSuccess: (r: any) => {
        setToast({
          ok: true,
          msg: r.msg ?? (mode === 'edit' ? '수정이 완료되었습니다.' : '등록이 완료되었습니다.'),
        });
        if (mode === 'create') {
          form.reset();
          setFile(null);
          setPreview(null);
        }
      },
      onError: (err: any) => {
        setToast({ ok: false, msg: err?.message ?? '오류가 발생했습니다.' });
      },
    });
  }

  const submitting = mutation.isPending;

  // edit 모드 가드
  if (mode === 'edit') {
    if (typeof id !== 'number') {
      return (
        <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          잘못된 접근입니다. (id 없음)
        </div>
      );
    }
    if (isLoading) {
      return (
        <div className="animate-pulse rounded-md border p-3 text-sm text-neutral-500">
          로딩 중...
        </div>
      );
    }
    if (isError || !data) {
      return (
        <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700">
          {(error as Error)?.message ?? '로딩 중 오류가 발생했습니다.'}
        </div>
      );
    }
  }

  // 입력 기본값 (create: 빈값, edit: 불러온 값)
  const initial: Partial<PlaceFormValuesType> =
    mode === 'edit' && data
      ? {
          id: Number(data.id),
          name: String(data.name ?? ''),
          category: data.category as PlaceCategoryType,
          region: data.region as PlaceRegionType,
          description: data.description ?? '',
          address: data.address_line1 ?? '',
          phone: data.phone ?? '',
          tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
          image_url: data.image_url ?? null,
          hours: data.hours ?? '',
        }
      : {
          name: '',
          category: 'food' as PlaceCategoryType,
          region: 'north' as PlaceRegionType,
          description: '',
          address: '',
          phone: '',
          tags: [],
          image_url: null,
          hours: '',
        };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
      {mode === 'edit' && typeof initial.id === 'number' && (
        <input type="hidden" name="id" defaultValue={String(initial.id)} />
      )}

      {/* 이름 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">이름 *</label>
        <input
          name="name"
          defaultValue={initial.name ?? ''}
          required
          className="ring-brand-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          placeholder="예) 카페 멜몬도"
        />
      </div>

      {/* 카테고리/지역 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-800">카테고리 *</label>
          <select
            name="category"
            defaultValue={initial.category ?? 'food'}
            required
            className="ring-brand-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-800">지역 *</label>
          <select
            name="region"
            defaultValue={initial.region ?? 'north'}
            required
            className="ring-brand-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          >
            {regions.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 설명 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">설명</label>
        <textarea
          name="description"
          defaultValue={initial.description ?? ''}
          rows={3}
          className="ring-brand-500 w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          placeholder="간단한 한 줄 소개나 메모"
        />
      </div>

      {/* 주소/전화/시간 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">주소</label>
        <input
          name="address"
          defaultValue={initial.address ?? ''}
          className="ring-brand-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          placeholder="제주특별자치도 ..."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">전화번호</label>
        <input
          name="phone"
          defaultValue={initial.phone ?? ''}
          className="ring-brand-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          placeholder="064-000-0000"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">영업시간</label>
        <input
          name="hours"
          defaultValue={initial.hours ?? ''}
          className="ring-brand-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          placeholder="예) 매일 09:00~21:00 (주말 10:00~20:00)"
        />
      </div>

      {/* 태그: CSV */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">
          태그 (쉼표로 구분)
        </label>
        <input
          name="tags"
          defaultValue={(initial.tags ?? []).join(', ')}
          className="ring-brand-500 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:ring-2"
          placeholder="예) 해산물, 뷰맛집, 브런치"
        />
      </div>

      {/* 이미지 업로드 + 미리보기 */}
      <div>
        <label className="mb-1 block text-sm font-medium text-neutral-800">대표 이미지</label>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">
            <LuUploadCloud />
            <span>파일 선택</span>
            <input
              name="image"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="hidden"
            />
          </label>
          {file && <span className="text-sm text-neutral-600">{file.name}</span>}
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200">
          {preview ? (
            <Image
              src={preview}
              alt="미리보기"
              width={560}
              height={320}
              className="h-40 w-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-40 items-center justify-center gap-2 text-neutral-400">
              <LuImage />
              <span className="text-sm">미리보기 없음</span>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            toast.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={submitting}
          className={`bg-brand-500 hover:bg-brand-600 w-full rounded-xl py-3 text-center text-sm font-semibold text-white shadow-sm transition ${
            submitting ? 'opacity-60' : ''
          }`}
        >
          {submitting
            ? mode === 'edit'
              ? '수정 중...'
              : '등록 중...'
            : mode === 'edit'
              ? '수정하기'
              : '등록하기'}
        </button>
      </div>
    </form>
  );
}
