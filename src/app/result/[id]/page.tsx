import PlaceDetailCard from '@/components/Result/PlaceDetailCard';

export default function Page({ params }: { params: { id: string } }) {
  const placeId = Number(params.id);

  return (
    <div className="my-5">
      <PlaceDetailCard id={placeId} />
    </div>
  );
}
