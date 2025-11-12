import BackButton from '@/components/common/BackButton';
import PlaceForm from '@/components/Place/Form';

type Props = { params: Promise<{ id: string }> };

export default async function PlaceEdit({ params }: { params: { id: string } }) {
  const placeId = Number(params.id);

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mitme mb-4 text-4xl">장소 수정</h1>
        <BackButton />
      </div>
      <PlaceForm mode="edit" id={placeId} />
    </main>
  );
}
