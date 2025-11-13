import PlaceDetailCard from '@/components/Result/PlaceDetailCard';

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;
  const placeId = Number(id);

  return (
    <div className="my-5">
      <PlaceDetailCard id={placeId} />
    </div>
  );
}
