import { Suspense } from 'react';
import Logo from '@/components/common/Logo';
import Filter from '@/components/Main/Filter';
import FilterPick from '@/components/Main/FilterPick';
import QuickPick from '@/components/Main/QuickPick';

export default function Home() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-neutral-500">불러오는 중…</div>}>
      <Logo size={210} className="mx-auto my-10" />
      <Filter />
      <FilterPick />
      <QuickPick />
    </Suspense>
  );
}
