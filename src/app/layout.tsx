// The real root layout (with <html lang>) lives in app/[lang]/layout.tsx so each
// language is server-rendered with its own lang attribute and metadata.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
