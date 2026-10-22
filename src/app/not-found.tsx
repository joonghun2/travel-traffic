import Link from 'next/link';
import './globals.css';

// Rendered for URLs outside the [lang] segment, so it needs its own <html>.
export default function NotFound() {
  return (
    <html lang="ko">
      <body className="antialiased bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="text-2xl font-bold">404</h1>
          <p className="text-sm text-gray-500">페이지를 찾을 수 없습니다 · Page not found · ページが見つかりません</p>
          <nav className="flex gap-3 text-sm font-semibold text-blue-600">
            <Link href="/">한국어</Link>
            <Link href="/en">English</Link>
            <Link href="/ja">日本語</Link>
          </nav>
        </main>
      </body>
    </html>
  );
}
