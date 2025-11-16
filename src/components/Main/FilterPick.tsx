'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { LuDices } from 'react-icons/lu';
import { useFilterStore } from '@/stores/filterStore';
import { pickPlaceAction } from '@/actions/pick-actions';

const FilterPick = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { region, category, lat, lng, radius } = useFilterStore();
  const [isPicking, setIsPicking] = useState<string | null>(null);

  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async () => {
      const res = await pickPlaceAction({ region, category, lat, lng, radius });
      if (!res.ok) throw new Error(res.message);
      return res;
    },
    onSuccess: (res) => {
      const place = res.data;

      if (place.image_url && typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = place.image_url;
      }

      queryClient.setQueryData(['place', place.id], place);
      router.push(`/result/${place!.id}`);
    },
    onError: () => {
      setIsPicking(null);
    },
  });

  const isLoading = isPending || isPicking === 'picking';

  return (
    <div className="my-5 space-y-3">
      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error instanceof Error ? error.message : '오류가 발생했습니다.'}
        </div>
      )}

      <button
        onClick={() => {
          if (isPending) return;
          setIsPicking('picking');
          mutate();
        }}
        disabled={isLoading}
        className={`cursor-pointer font-mitme flex h-48 w-full items-center justify-center gap-2 rounded-xl text-5xl text-white shadow-xl transition ${
          isLoading
            ? 'bg-brand-400 cursor-not-allowed opacity-70'
            : 'bg-brand-500 hover:bg-brand-600'
        }`}
      >
        {isLoading ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
            className="inline-flex"
          >
            <LuDices />
          </motion.span>
        ) : (
          <LuDices />
        )}
        {isLoading ? '뽑는 중…' : '어디갈래?'}
      </button>
    </div>
  );
};

export default FilterPick;
