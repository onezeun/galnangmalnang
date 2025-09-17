import Logo from '@/components/common/Logo';
import Filter from '@/components/Main/Filter';
import QuickPick from '@/components/Main/QuickPick';
import { LuDices } from 'react-icons/lu';

export default function Home() {
  return (
    <div>
      <Logo size={210} className="mx-auto my-10" />
      <Filter />
      <button type='button' className="flex justify-center items-center gap-2 font-mitme bg-brand-500 h-40 w-full rounded-xl text-white text-5xl my-5 shadow-xl">
        <LuDices />
        어디갈래?
      </button>
      <QuickPick />
    </div>
  );
}
