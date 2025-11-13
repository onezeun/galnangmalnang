import type { Metadata } from 'next';
import { QueryClient, dehydrate } from '@tanstack/react-query';
import ReactQueryClientProvider from '@/config/ReactQueryClientProvider';
import { getAuthAction } from '@/actions/auth-actions';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import './globals.css';

export const metadata: Metadata = {
  title: '갈낭말낭',
  description: '갈까 말까의 제주도 방언으로 제주도 여행지 랜덤 뽑기 사이트',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const qc = new QueryClient();
  await qc.prefetchQuery({
    queryKey: ['auth'],
    queryFn: getAuthAction,
  });
  const dehydratedState = dehydrate(qc);

  return (
    <html lang="ko">
      <body className="font-pretendard antialiased">
        <ReactQueryClientProvider dehydratedState={dehydratedState}>
          <div className="bg-brand-50 mx-auto max-w-[800px]">
            <Header />
            <main className="mx-4 min-h-[100dvh]">{children}</main>
            <Footer />
          </div>
        </ReactQueryClientProvider>
      </body>
    </html>
  );
}
