'use client';

import { useState } from 'react';
import { LuFilter, LuChevronDown } from 'react-icons/lu';

const Filter = () => {
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState('all');
  const [category, setCategory] = useState('all');

  const base = 'w-full rounded-xl px-4 py-3 text-sm transition-colors border';
  const active = 'border-transparent bg-brand-500 text-white';
  const idle = 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50';

  const regionOptions = [
    { value: 'all', label: '전체' },
    { value: 'nearby', label: '현재위치근처' },
    { value: 'jeju-north', label: '제주시/북부' },
    { value: 'seogwipo-south', label: '서귀포/남부' },
    { value: 'east', label: '동부' },
    { value: 'west', label: '서부' },
  ];

  const categoryOptions = [
    { value: 'all', label: '전체' },
    { value: 'food', label: '음식점' },
    { value: 'cafe', label: '카페' },
    { value: 'sight', label: '관광지' },
  ];

  const handleApply = () => {
    console.log({ region, category });
    setOpen(false);
  };

  return (
    <div className="relative inline-block w-full">
      {/* 토글 버튼 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="focus:ring-brand-500 flex w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm hover:bg-neutral-50 focus:ring-2 focus:outline-none"
      >
        <span className="inline-flex items-center gap-2">
          <LuFilter className="h-4 w-4 text-neutral-500" />
          <span>필터 설정</span>
        </span>
        <LuChevronDown
          className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* 드롭다운 내용 */}
      {open && (
        <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          {/* 지역 */}
          <h3 className="text-brand-900 font-mitme mb-2 text-xl">지역</h3>
          <div className="grid grid-cols-2 gap-3">
            {regionOptions.map((r) => (
              <button
                key={r.value}
                className={`${base} ${region === r.value ? active : idle}`}
                onClick={() => setRegion(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* 카테고리 */}
          <h3 className="text-brand-900 font-mitme mt-5 mb-2 text-xl">카테고리</h3>
          <div className="grid grid-cols-2 gap-3">
            {categoryOptions.map((c) => (
              <button
                key={c.value}
                className={`${base} ${category === c.value ? active : idle}`}
                onClick={() => setCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* 적용 */}
          <button
            className="mt-5 w-full rounded-2xl font-mitme text-xl bg-brand-100 py-3 text-center text-sm  text-brand-800 transition-colors hover:bg-brand-200"
            onClick={handleApply}
          >
            적용
          </button>
        </div>
      )}
    </div>
  );
};

export default Filter;
