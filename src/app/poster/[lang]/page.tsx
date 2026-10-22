import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QRCode from 'qrcode';
import { Lang } from '@/types';
import { LANGS, SITE_URL, isLang, localizePath } from '@/lib/i18n/routing';
import { TRANSLATIONS } from '@/lib/i18n/translations';
import { withUtm } from '@/lib/utm';

export const dynamicParams = false;

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export const metadata: Metadata = { title: 'Check East Point — QR poster', robots: { index: false, follow: false } };

const tr = (lang: Lang, key: string) => TRANSLATIONS[lang][key] ?? TRANSLATIONS.en[key] ?? key;

const CSS = `
@page{size:A4;margin:0}
*{box-sizing:border-box}
.poster{width:210mm;height:297mm;padding:22mm 18mm 16mm;display:flex;flex-direction:column;align-items:center;text-align:center;
background:linear-gradient(160deg,#0f172a 0%,#1e3a8a 60%,#312e81 100%);color:#fff;
font-family:system-ui,-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Hiragino Sans","Noto Sans JP","PingFang SC","PingFang TC","Noto Sans SC",sans-serif;
-webkit-print-color-adjust:exact;print-color-adjust:exact}
.brand{display:flex;align-items:center;gap:4mm;font-size:6mm;font-weight:700}
.logo{width:11mm;height:11mm;border-radius:3mm;background:linear-gradient(45deg,#2563eb,#6366f1);display:flex;align-items:center;justify-content:center}
h1{font-size:15mm;line-height:1.15;margin:14mm 0 4mm;font-weight:900}
.sub{font-size:6.5mm;color:#bfdbfe;margin:0}
.qr{margin:12mm 0 6mm;padding:5mm;background:#fff;border-radius:6mm}
.qr svg{display:block;width:80mm;height:80mm}
.scan{font-size:6mm;font-weight:700;margin:0}
.url{font-size:5mm;color:#93c5fd;margin:2mm 0 0}
ul{list-style:none;padding:0;margin:12mm 0 0;display:flex;flex-direction:column;gap:3.5mm;font-size:5.2mm;text-align:left}
li::before{content:"✓ ";color:#6ee7b7;font-weight:900}
.free{margin-top:auto;font-size:4.5mm;color:#cbd5e1}
`;

export default async function PosterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const link = withUtm(`${SITE_URL}${localizePath('/', lang)}`, { source: 'poster', medium: 'qr', campaign: 'poster', content: lang });
  const qr = await QRCode.toString(link, { type: 'svg', margin: 0, errorCorrectionLevel: 'M', color: { dark: '#0f172a', light: '#ffffff' } });
  const shortUrl = `checkeastpoint.com${lang === 'ko' ? '' : `/${lang}`}`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <main className="poster">
        <div className="brand">
          <span className="logo">C</span>
          Check East Point
        </div>
        <h1>{tr(lang, 'poster.headline')}</h1>
        <p className="sub">{tr(lang, 'poster.sub')}</p>
        <div className="qr" dangerouslySetInnerHTML={{ __html: qr }} />
        <p className="scan">{tr(lang, 'poster.scan')}</p>
        <p className="url">{shortUrl}</p>
        <ul>
          <li>{tr(lang, 'poster.p1')}</li>
          <li>{tr(lang, 'poster.p2')}</li>
          <li>{tr(lang, 'poster.p3')}</li>
        </ul>
        <p className="free">{tr(lang, 'poster.free')}</p>
      </main>
    </>
  );
}
