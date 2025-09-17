'use client';

import Image from 'next/image';

const QuickPick = () => {
  const items = [
    { id: 'food', label: '음식점', iconSrc: '/images/quick_food.svg' },
    { id: 'cafe', label: '카페', iconSrc: '/images/quick_cafe.svg' },
    { id: 'sight', label: '관광지', iconSrc: '/images/quick_sight.svg' },
  ];

  const handleSelect = (id: string) => {
    console.log('선택한 카테고리:', id);
  };

  return (
    <section className="rounded-2xl bg-[--color-brand-50]/50 p-3 font-mitme text-brand-900">
      <h2 className="px-1 pb-2 text-2xl">빠르게 뽑기</h2>

      <ul role="list" className="flex flex-col gap-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => handleSelect(item.id)}
              className="focus:ring-brand-500 w-full rounded-2xl border border-neutral-200 bg-white px-4 py-5 text-center shadow-sm transition-colors hover:bg-neutral-50 focus:ring-2 focus:outline-none"
            >
              <div className="mx-auto mb-2 h-14 w-14">
                <Image
                  src={item.iconSrc}
                  alt={item.label}
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
              <span className="text-xl">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default QuickPick;
