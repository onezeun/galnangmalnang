'use client';

import Image from 'next/image';
import { pickByCategoryAction } from '@/actions/pick-actions';
import { useFormStatus } from 'react-dom';

const items = [
  { id: 'food', label: '음식점', iconSrc: '/images/quick_food.svg' },
  { id: 'cafe', label: '카페', iconSrc: '/images/quick_cafe.svg' },
  { id: 'sight', label: '관광지', iconSrc: '/images/quick_sight.svg' },
] as const;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`focus:ring-brand-500 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-5 text-center shadow-sm transition-colors hover:bg-neutral-50 focus:ring-2 focus:outline-none ${pending ? 'opacity-60' : ''}`}
    >
      <div className="mx-auto mb-2 h-14 w-14">
        {/* 아이콘은 폼 바깥에서 내려받으므로 이 버튼에서는 스킵 */}
      </div>
      <span className="text-xl">{pending ? '뽑는 중…' : `${label} 뽑기`}</span>
    </button>
  );
}

export default function QuickPick() {
  return (
    <section className="font-mitme text-brand-900 rounded-2xl bg-[--color-brand-50]/50 p-3">
      <h2 className="px-1 pb-2 text-2xl">빠르게 뽑기</h2>

      <ul role="list" className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <form action={pickByCategoryAction} className="relative">
              {/* 카테고리 hidden 필드 */}
              <input type="hidden" name="category" value={item.id} />

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

              {/* 제출 버튼 */}
              <SubmitButton label={item.label} />
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
