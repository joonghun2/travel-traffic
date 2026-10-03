import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { TranslationProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/ThemeContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
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
    default: 'Check East Point | 서울 주요 관광지 실시간 혼잡도 확인',
    template: '%s | Check East Point',
  },
  description:
    '경복궁, 명동, 홍대, 성수 등 서울 주요 관광지와 핫플레이스의 실시간 혼잡도를 확인하세요. 쾌적한 서울 여행과 나들이 일정을 위한 실시간 가이드 서비스.',
  keywords: [
    '서울 실시간 혼잡도',
    '서울 관광지 혼잡도',
    '서울 여행 혼잡도',
    '경복궁 혼잡도',
    '성수동 혼잡도',
    '홍대 혼잡도',
    '명동 혼잡도',
    'Check East Point',
    '체크이스트포인트',
  ],
  authors: [{ name: 'Check East Point' }],
  creator: 'Check East Point',
  publisher: 'Check East Point',
  alternates: {
    canonical: 'https://www.checkeastpoint.com/',
    languages: {
      'ko': 'https://www.checkeastpoint.com/',
      'en': 'https://www.checkeastpoint.com/?lang=en',
      'ja': 'https://www.checkeastpoint.com/?lang=ja',
    },
  },
  openGraph: {
    title: 'Check East Point | 서울 주요 관광지 실시간 혼잡도 확인',
    description:
      '경복궁, 명동, 홍대, 성수 등 서울 주요 관광지와 핫플레이스의 실시간 혼잡도를 확인하세요. 쾌적한 서울 여행과 나들이 일정을 위한 실시간 가이드 서비스.',
    url: 'https://www.checkeastpoint.com/',
    siteName: 'Check East Point',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: 'https://www.checkeastpoint.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Check East Point - 서울 주요 관광지 실시간 혼잡도 확인',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Check East Point | 서울 주요 관광지 실시간 혼잡도 확인',
    description:
      '경복궁, 명동, 홍대, 성수 등 서울 주요 관광지와 핫플레이스의 실시간 혼잡도를 확인하세요. 쾌적한 서울 여행과 나들이 일정을 위한 실시간 가이드 서비스.',
    images: ['https://www.checkeastpoint.com/og-image.png'],
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
  name: 'Check East Point',
  alternateName: ['체크이스트포인트', 'SeoulLive', 'Travel Traffic'],
  url: 'https://www.checkeastpoint.com/',
  description:
    '경복궁, 명동, 홍대, 성수 등 서울 주요 관광지와 핫플레이스의 실시간 혼잡도를 확인하세요. 쾌적한 서울 여행과 나들이 일정을 위한 실시간 가이드 서비스.',
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
        {/* Google Analytics (gtag.js) - lazyOnload to prioritize LCP and minimize TBT */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EJC5R171MS"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EJC5R171MS');
          `}
        </Script>
      </body>
    </html>
  );
}
