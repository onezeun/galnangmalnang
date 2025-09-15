import Image from 'next/image';

export default function Home() {
  return (
    <div>
      <Image src="/logo.png" alt="logo" width={180} height={38} priority />
      <p>갈낭말낭</p>
    </div>
  );
}
