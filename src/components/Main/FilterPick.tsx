'use client';

import { LuDices } from 'react-icons/lu';
import { pickPlaceAction } from '@/actions/pick-actions';
import { useFormStatus } from 'react-dom';
import { useFilterStore } from '@/stores/filterStore';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const { region, category, lat, lng, radius } = useFilterStore();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formAction = async (formData: FormData) => {
    const res = await pickPlaceAction(formData);
    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }
    if (res.redirect) {
      router.replace(res.redirect);
      return;
    }
  };

  return (
    <form action={formAction} className="my-5">
      {/* 에러 배너 */}
      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMsg}
        </div>
      )}
      <input type="hidden" name="region" value={region} />
      <input type="hidden" name="category" value={category} />
      {region === 'nearby' && lat && lng && (
        <>
          <input type="hidden" name="lat" value={lat} />
          <input type="hidden" name="lng" value={lng} />
          <input type="hidden" name="r" value={radius} />
        </>
      )}

      <SubmitButton />
    </form>
  );
};

export default FilterPick;
