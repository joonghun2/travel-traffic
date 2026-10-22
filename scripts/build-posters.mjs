// Prints the A4 QR posters (/poster/<lang>) to public/posters/*.pdf with headless Chrome.
// usage: npm run build && npx next start -p 3100   (in another shell)
//        node scripts/build-posters.mjs [http://localhost:3100]
import { execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://localhost:3100';
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
mkdirSync('public/posters', { recursive: true });

for (const lang of ['ko', 'en', 'ja', 'zh-cn', 'zh-tw']) {
  const out = `public/posters/checkeastpoint-poster-${lang}.pdf`;
  execFileSync(chrome, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${out}`, `${base}/poster/${lang}`], {
    stdio: 'ignore',
  });
  console.log('wrote', out);
}
