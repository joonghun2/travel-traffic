import '../globals.css';

// Bare operator page (no site header/footer, analytics or ads).
export default function SnsLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
