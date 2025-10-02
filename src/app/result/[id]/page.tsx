import PlaceDetailCard from '@/components/Result/PlaceDetailCard';
import { notFound } from 'next/navigation';

export default function Page({ params }: { params: { id: string } }) {
  const placeId = Number(params.id);
  if (!Number.isFinite(placeId)) notFound();
  return (
    <div className="my-5">
      <PlaceDetailCard id={placeId} />
    </div>
  );
}
