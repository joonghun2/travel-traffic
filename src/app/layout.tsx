import type { Metadata, Viewport } from 'next';
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL('https://www.checkeastpoint.com'),
  title: {
    default: 'SeoulLive - 서울 실시간 혼잡도 & 스마트 길찾기 가이드',
    template: '%s | SeoulLive',
  },
  description:
    '서울시 실시간 도시데이터 121개 주요 핫스팟 기반 인파 혼잡 지수, 대기시간, 현위치 기준 이동 시간 및 도보 우회 히든 스팟 안내',
  keywords: [
    '서울 실시간 혼잡도',
    '서울 관광지 인파',
    '서울 여행 코스',
    '경복궁 혼잡도',
    '홍대 실시간',
    '성수동 실시간',
    '명동 실시간',
    '서울 도보 길찾기',
    '서울 우회 명소',
    '서울시 실시간 도시데이터',
    'CheckEastPoint',
  ],
  authors: [{ name: 'SeoulLive' }],
  creator: 'SeoulLive',
  publisher: 'SeoulLive',
  alternates: {
    canonical: 'https://www.checkeastpoint.com',
    languages: {
      'ko': 'https://www.checkeastpoint.com/',
      'en': 'https://www.checkeastpoint.com/?lang=en',
      'ja': 'https://www.checkeastpoint.com/?lang=ja',
    },
  },
  openGraph: {
    title: 'SeoulLive - 서울 실시간 혼잡도 & 스마트 길찾기',
    description:
      '서울시 공공데이터 기반 121개 핫스팟 실시간 혼잡도와 대기시간, 내 위치 기준 이동 시간 안내',
    url: 'https://www.checkeastpoint.com',
    siteName: 'SeoulLive',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SeoulLive - 서울 실시간 혼잡도 & 스마트 길찾기',
    description:
      '서울시 공공데이터 기반 121개 핫스팟 실시간 혼잡도와 대기시간, 내 위치 기준 이동 시간 안내',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    other: {
      'naver-site-verification': 'bf142bf867c7b4c6ffc6fd7ec9b8e4a4f355f04e',
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'SeoulLive',
  url: 'https://www.checkeastpoint.com',
  description:
    '서울시 실시간 도시데이터 121개 핫스팟 기반 인파 혼잡 지수 및 스마트 길찾기 가이드',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'All',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'KRW',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-200`}
      >
        <ThemeProvider>
          <TranslationProvider>{children}</TranslationProvider>
        </ThemeProvider>
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EJC5R171MS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EJC5R171MS');
          `}
        </Script>
        {/* Kakao AdFit SDK */}
        <Script
          src="//t1.kakaocdn.net/kas/static/ba.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
