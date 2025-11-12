import type { Metadata } from 'next';
import './globals.css';
import ReactQueryClientProvider from '@/config/ReactQueryClientProvider';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HydrateAuth from '@/components/layout/HydrateAuth';
import { getAuthAction } from '@/actions/auth-actions';

export const metadata: Metadata = {
  title: '갈낭말낭',
  description: '갈까 말까의 제주도 방언으로 제주도 여행지 랜덤 뽑기 사이트',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const res = await getAuthAction(); // 서버에서 1회만 확인
    const initialUser = res.ok && res.data.isLoggedIn ? res.data.user : null;
  return (
    <html lang="ko">
      <body className="font-pretendard antialiased">
        <ReactQueryClientProvider>
          <div className="bg-brand-50 mx-auto max-w-[800px]">
            <HydrateAuth initial={initialUser} />
            <Header />
            <main className="mx-4 min-h-[100dvh]">{children}</main>
            <Footer />
          </div>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
