import BackButton from '@/components/common/BackButton';
import PlaceForm from '@/components/Place/Form';

export default function PlaceNewPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-mitme text-4xl">장소 신규 등록</h1>
        <BackButton />
      </div>
      <PlaceForm mode="create" />
    </main>
  );
}
