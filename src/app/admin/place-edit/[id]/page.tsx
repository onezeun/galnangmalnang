import BackButton from '@/components/common/BackButton';
import PlaceForm from '@/components/Place/Form';
import { notFound } from 'next/navigation';

type Props = { params: Promise<{ id: string }> };

export default async function PlaceEdit({ params }: Props) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mitme mb-4 text-4xl">장소 수정</h1>
        <BackButton />
      </div>
      <PlaceForm mode="edit" id={id} />
    </main>
  );
}
