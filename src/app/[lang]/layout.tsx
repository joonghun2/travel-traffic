import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Geist, Geist_Mono } from 'next/font/google';
import Script from 'next/script';
import '../globals.css';
import { TranslationProvider } from '@/lib/i18n/context';
import { ThemeProvider } from '@/lib/theme/ThemeContext';
import { LANGS, SITE_URL, isLang, languageAlternates, localizePath, htmlLang } from '@/lib/i18n/routing';
import { SEO } from '@/lib/i18n/seo';

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

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#030712' },
  ],
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  const seo = SEO[lang];
  const url = `${SITE_URL}${localizePath('/', lang)}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: seo.title,
      template: '%s | Check East Point',
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: 'Check East Point' }],
    creator: 'Check East Point',
    publisher: 'Check East Point',
    alternates: {
      canonical: url,
      languages: languageAlternates('/'),
    },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url,
      siteName: 'Check East Point',
      locale: seo.ogLocale,
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => SEO[l].ogLocale),
      type: 'website',
      images: [
        {
          url: `${SITE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: seo.ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [`${SITE_URL}/og-image.png`],
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
}

export default async function LangLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Check East Point',
    alternateName: ['체크이스트포인트', 'SeoulLive', 'Travel Traffic'],
    url: `${SITE_URL}${localizePath('/', lang)}`,
    inLanguage: lang,
    description: SEO[lang].description,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'KRW',
    },
  };

  return (
    <html lang={htmlLang(lang)} suppressHydrationWarning>
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
          <TranslationProvider lang={lang}>{children}</TranslationProvider>
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
        {/* Kakao AdFit Script - lazyOnload */}
        <Script
          src="//t1.kakaocdn.net/kas/static/ba.min.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
