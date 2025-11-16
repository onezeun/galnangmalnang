'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { pickByCategoryAction } from '@/actions/pick-actions';

const items = [
  { id: 'food', label: '음식점', iconSrc: '/images/quick_food.svg' },
  { id: 'cafe', label: '카페', iconSrc: '/images/quick_cafe.svg' },
  { id: 'sight', label: '관광지', iconSrc: '/images/quick_sight.svg' },
] as const;

export default function QuickPick() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (category: string) => {
      const res = await pickByCategoryAction(category);
      if (!res.ok) throw new Error(res.message);
      return res;
    },
    onSuccess: (res) => {
      const place = res.data;

      if (place!.image_url && typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = place!.image_url;
      }

      queryClient.setQueryData(['place', place!.id], place);
      router.push(`/result/${place!.id}`);
    },
    onError: () => {
      setActiveId(null);
    },
  });

  return (
    <section className="font-mitme text-brand-900 rounded-2xl bg-[--color-brand-50]/50 p-3">
      <h2 className="px-1 pb-2 text-2xl">빠르게 뽑기</h2>
      {mutation.error && (
        <p className="font-pretendard my-3 font-bold rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {mutation.error instanceof Error ? mutation.error.message : '오류가 발생했습니다.'}
        </p>
      )}
      <ul role="list" className="flex flex-col gap-3">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id} className="bg-white">
              <button
                type="button"
                disabled={mutation.isPending}
                onClick={() => {
                  if (mutation.isPending) return;
                  setActiveId(item.id);
                  mutation.mutate(item.id);
                }}
                className={`cursor-pointer focus:ring-brand-500 relative w-full rounded-2xl border border-neutral-200 bg-white px-4 py-5 text-center shadow-sm transition-colors hover:bg-neutral-50 focus:ring-2 focus:outline-none ${
                  isActive ? 'opacity-60' : ''
                }`}
              >
                {/* 아이콘 */}
                <div className="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2">
                  <Image
                    src={item.iconSrc}
                    alt={item.label}
                    width={80}
                    height={80}
                    className="mx-auto"
                  />
                </div>

                <span className="mt-20 inline-block text-xl">
                  {isActive ? '뽑는 중…' : `${item.label} 뽑기`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
