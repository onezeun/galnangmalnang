'use client';

import { useSearchParams } from 'next/navigation';
import { LuDices } from 'react-icons/lu';
import { pickPlaceAction } from '@/actions/pick-actions';
import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`font-mitme flex h-48 w-full items-center justify-center gap-2 rounded-xl text-5xl text-white shadow-xl transition ${
        pending ? 'bg-brand-400 cursor-not-allowed opacity-70' : 'bg-brand-500 hover:bg-brand-600'
      }`}
    >
      <LuDices />
      {pending ? '뽑는 중…' : '어디갈래?'}
    </button>
  );
}

const FilterPick = () => {
  const sp = useSearchParams();
  const region = sp.get('region') ?? 'all';
  const category = sp.get('category') ?? 'all';
  const lat = sp.get('lat') ?? '';
  const lng = sp.get('lng') ?? '';
  const r = sp.get('r') ?? '2000';

  return (
    <form action={pickPlaceAction} className="my-5">
      <input type="hidden" name="region" value={region} />
      <input type="hidden" name="category" value={category} />
      {region === 'nearby' && (
        <>
          <input type="hidden" name="lat" value={lat} />
          <input type="hidden" name="lng" value={lng} />
          <input type="hidden" name="r" value={r} />
        </>
      )}

      <SubmitButton />
    </form>
  );
};

export default FilterPick;
