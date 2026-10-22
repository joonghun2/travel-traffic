import { htmlLang, isLang } from '@/lib/i18n/routing';

// Bare document for the iframe badge: no header, footer, ads or analytics.
export default async function EmbedLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <html lang={isLang(lang) ? htmlLang(lang) : 'en'}>
      <body style={{ margin: 0, background: 'transparent' }}>{children}</body>
    </html>
  );
}
