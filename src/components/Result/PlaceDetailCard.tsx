'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { LuShare2 } from 'react-icons/lu';
import { getPlaceByIdAction } from '@/actions/place-actions';
import { optionLabels } from '@/config/options';
import { PlaceCategoryType } from '@/types/places';

type Props = { id: number };

export default function PlaceDetailCard({ id }: Props) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['place', id],
    queryFn: async () => {
      const res = await getPlaceByIdAction(id);
      if (!res.ok) throw new Error('대상을 찾을 수 없습니다.');
      console.log(res)
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto w-full">
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="p-3">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="mx-3 mb-3 h-96 animate-pulse rounded-lg bg-neutral-200" />
          <div className="space-y-3 px-4 pb-4">
            <div className="h-5 w-48 animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-full animate-pulse rounded bg-neutral-200" />
            <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto w-full rounded-md bg-rose-50 p-3 text-sm text-rose-700">
        {(error as Error)?.message ?? '로딩 중 오류가 발생했습니다.'}
      </div>
    );
  }

  const { category, tags, name, description, address_line1, hours, phone, image_url } = data;

  return (
    <div className="mx-auto w-full">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {/* 배지 영역 */}
        <div className="flex flex-wrap gap-2 p-3">
          {category && (
            <span className="bg-brand-700/90 inline-block rounded-full px-2.5 py-1 text-xs text-white">
              {optionLabels.category[category as PlaceCategoryType] ?? category}
            </span>
          )}
          {tags?.map((tag: string) => (
            <span
              key={tag}
              className="inline-block rounded-full bg-neutral-200 px-2.5 py-1 text-xs text-neutral-700"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* 이미지 영역 */}
        <div className="mx-3 mb-3 h-1/2 rounded-lg bg-neutral-200/80 object-cover">
          {image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image_url} alt={name} className="h-full w-full rounded-lg object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg text-sm text-neutral-500">
              이미지
            </div>
          )}
        </div>

        {/* 본문 */}
        <div className="space-y-3 px-4 pb-4">
          <div className="flex items-start gap-2">
            <h3 className="text-brand-800 flex-1 text-base font-extrabold">{name}</h3>
            <button
              type="button"
              className="text-neutral-500 hover:text-neutral-700"
              onClick={() => {
                if (navigator?.share) {
                  navigator
                    .share({
                      title: name,
                      url: typeof window !== 'undefined' ? window.location.href : '',
                    })
                    .catch(() => {});
                } else if (typeof window !== 'undefined') {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('링크가 복사되었습니다.');
                }
              }}
              aria-label="공유"
              title="공유"
            >
              <LuShare2 />
            </button>
          </div>

          {description && (
            <p className="text-sm whitespace-pre-line text-neutral-600">{description}</p>
          )}

          {/* 정보 블록 */}
          <div className="space-y-1.5 text-sm text-neutral-600">
            {address_line1 && <p>{address_line1}</p>}
            {hours && <p>{hours}</p>}
            {phone && <p>{phone}</p>}
          </div>

          {/* 지도 버튼 */}
          <button
            type="button"
            className="bg-brand-500 hover:bg-brand-700 mt-2 w-full rounded-xl py-3 text-center text-sm font-semibold text-white"
            onClick={() => {
              const q = name || address_line1;
              if (q) {
                window.open(
                  `https://map.naver.com/v5/search/${encodeURIComponent(`제주도 ${q}`)}`,
                  '_blank'
                );
              } else {
                alert('검색할 장소 정보가 없습니다.');
              }
            }}
          >
            지도에서 보기
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => router.push('/')}
        className="mt-5 w-full rounded-xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
      >
        처음으로
      </button>
    </div>
  );
}
