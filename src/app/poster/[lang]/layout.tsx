import { htmlLang, isLang } from '@/lib/i18n/routing';

// Bare A4 document for the printable QR poster (scripts/build-posters.mjs prints it to PDF).
export default async function PosterLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return (
    <html lang={isLang(lang) ? htmlLang(lang) : 'en'}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
