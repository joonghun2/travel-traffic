import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { TranslationProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SeoulLive - 서울 실시간 혼잡도 & 스마트 길찾기 가이드',
  description:
    '서울시 실시간 도시데이터 121개 핫스팟 기반 인파 혼잡 지수, 대기시간, 현위치 기준 이동 시간 및 도보 우회 히든 스팟 안내',
  keywords: [
    '서울 실시간 혼잡도',
    '서울 관광지 인파',
    '경복궁 혼잡도',
    '홍대 실시간',
    '성수동 실시간',
    '명동 실시간',
    '서울 도보 길찾기',
    '서울 우회 명소',
    '서울시 실시간 도시데이터',
  ],
  openGraph: {
    title: 'SeoulLive - 서울 실시간 혼잡도 & 스마트 길찾기',
    description:
      '서울시 공공데이터 기반 실시간 혼잡도와 대기시간, 내 위치 기준 이동 시간 안내',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200`}
      >
        <ThemeProvider>
          <TranslationProvider>{children}</TranslationProvider>
        </ThemeProvider>
        <Script
          src="//t1.kakaocdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
