import type { Metadata } from 'next';
import Script from 'next/script';
import ReactQueryClientProvider from '@/config/ReactQueryClientProvider';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import { KAKAO_JS_API_KEY } from '@/config';
import './globals.css';

declare global {
  interface Window {
    Kakao: any;
  }
}

export const metadata: Metadata = {
  title: '갈낭말낭',
  description: '갈까 말까의 제주도 방언으로 제주도 여행지 랜덤 뽑기 사이트',
  openGraph: {
    title: '갈낭말낭🍊',
    description: '갈까 말까의 제주도 방언으로 제주도 여행지 랜덤 뽑기 사이트',
    url: 'https://galnangmalnang.vercel.app/',
    siteName: '갈낭말낭',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: '갈낭말낭 로고 이미지',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Kakao SDK */}
        <Script
          src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.8/kakao.min.js"
          integrity="sha384-WUSirVbD0ASvo37f3qQZuDap8wy76aJjmGyXKOYgPL/NdAs8HhgmPlk9dz2XQsNv"
          crossOrigin="anonymous"
        />
        <meta name="kakao-sdk-app-key" content={KAKAO_JS_API_KEY} />
      </head>
      <body className="font-pretendard antialiased">
        <ReactQueryClientProvider>
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
