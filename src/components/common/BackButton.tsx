'use client';

import { useRouter } from 'next/navigation';
import { LuChevronLeft } from 'react-icons/lu';

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-center justify-center w-10 h-10 rounded-md text-neutral-700 cursor-pointer transition duration-150 hover:-translate-x-0.5 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
    >
      <LuChevronLeft className="w-6 h-6" />
    </button>
  );
}
