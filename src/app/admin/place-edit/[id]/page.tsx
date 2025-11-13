import BackButton from '@/components/common/BackButton';
import PlaceForm from '@/components/Place/Form';

export default async function PlaceEdit({ params }: { params: { id: string } }) {
  const { id } = await params;
  const placeId = Number(id);

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="absolute">
          <BackButton />
        </div>
        <h1 className="font-mitme text-4xl leading-tight cursor-default w-full text-center">
          장소 수정
        </h1>
      </div>
      <PlaceForm mode="edit" id={placeId} />
    </main>
  );
}
