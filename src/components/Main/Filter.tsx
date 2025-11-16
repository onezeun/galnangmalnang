'use client';

import { useEffect, useMemo, useState } from 'react';
import { LuChevronDown, LuFilter } from 'react-icons/lu';
import { categoryOptions, optionLabels, regionOptions } from '@/config/options';
import { PlaceCategoryType, PlaceRegionType } from '@/types/places';
import { useFilterStore } from '@/stores/filterStore';

export default function Filter() {
  const [open, setOpen] = useState(false);
  const [locStatus, setLocStatus] = useState('');

  const { region, category, lat, lng, radius, setRegion, setCategory, setLocation, setRadius } =
    useFilterStore();

  // nearby 선택 시 위치 요청
  useEffect(() => {
    if (region !== 'nearby') return;
    if (!('geolocation' in navigator)) {
      setLocStatus('error');
      return;
    }
    setLocStatus('getting');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude);
        setLocStatus('ok');
      },
      (err) => {
        console.error(err);
        setLocStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error');
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [region]);

  // 선택 항목 UI 표시
  const summaryChips = useMemo(() => {
    const chips: string[] = [];

    if (region !== 'all') chips.push(`지역: ${optionLabels.region[region] ?? region}`);

    if (category !== 'all') chips.push(`카테고리: ${optionLabels.category[category] ?? category}`);

    if (region === 'nearby' && lat && lng) chips.push(`반경: ${Number(radius) / 1000}km`);

    return chips;
  }, [region, category, lat, lng, radius]);

  return (
    <div className="relative inline-block w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="cursor-pointer focus:ring-brand-500 flex w-full items-center justify-between rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700 shadow-sm hover:bg-neutral-50 focus:ring-2 focus:outline-none"
      >
        <span className="inline-flex items-center gap-2">
          <LuFilter className="h-4 w-4 text-neutral-500" />
          <span>필터 설정</span>
        </span>
        <LuChevronDown
          className={`h-4 w-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {summaryChips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 cursor-default">
          {summaryChips.map((t) => (
            <span key={t} className="bg-brand-50 text-brand-800 rounded-full px-3 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-2 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          {/* 지역 */}
          <h3 className="text-brand-900 font-mitme mb-2 text-xl cursor-default">지역</h3>
          <div className="grid grid-cols-2 gap-3">
            {regionOptions.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`cursor-pointer w-full rounded-xl border px-4 py-3 text-sm transition-colors ${region === r.value ? 'bg-brand-500 border-transparent text-white' : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'}`}
                onClick={() => setRegion(r.value as PlaceRegionType)}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* nearby 상태 표시 & 반경 */}
          {region === 'nearby' && (
            <div className="mt-3 rounded-md bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
              {locStatus === 'getting' && '현재 위치를 가져오는 중…'}
              {locStatus === 'ok' && (
                <div className="flex items-center justify-between gap-3 cursor-default">
                  <span>현재 위치에서 얼마나?</span>
                  <select
                    className="rounded border border-neutral-300 px-2 py-1 text-xs"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                  >
                    <option value="1000">1km</option>
                    <option value="3000">3km</option>
                    <option value="5000">5km</option>
                    <option value="10000">10km</option>
                  </select>
                </div>
              )}
              {locStatus === 'denied' &&
                '위치 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.'}
              {locStatus === 'error' && '위치 정보를 가져오지 못했습니다.'}
            </div>
          )}

          {/* 카테고리 */}
          <h3 className="text-brand-900 font-mitme mt-5 mb-2 text-xl cursor-default">카테고리</h3>
          <div className="grid grid-cols-2 gap-3">
            {categoryOptions.map((c) => (
              <button
                key={c.value}
                type="button"
                className={`cursor-pointer w-full border rounded-xl px-4 py-3 text-sm transition-colors ${category === c.value ? 'bg-brand-500 border-transparent text-white' : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'}`}
                onClick={() => setCategory(c.value as PlaceCategoryType)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <button
            className="cursor-pointer font-mitme bg-brand-100 text-brand-800 hover:bg-brand-200 mt-5 w-full rounded-2xl py-3 text-center text-xl transition-colors"
            onClick={() => setOpen(false)}
            disabled={region === 'nearby' && locStatus !== 'ok'}
          >
            닫기
          </button>
        </div>
      )}
    </div>
  );
}
