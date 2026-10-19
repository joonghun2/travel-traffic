import { ImageResponse } from 'next/og';

export const contentType = 'image/png';

const SIZES = [32, 192, 512];

// Served at /icon/32, /icon/192, /icon/512 (favicon + PWA manifest icons).
export function generateImageMetadata() {
  return SIZES.map((s) => ({ id: String(s), size: { width: s, height: s }, contentType }));
}

export default async function Icon({ id }: { id: Promise<string> | string }) {
  const s = Number(await id);
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(45deg, #2563eb, #6366f1)',
          borderRadius: s <= 32 ? s * 0.22 : 0,
          color: 'white',
          fontSize: s * 0.6,
          fontWeight: 900,
        }}
      >
        C
      </div>
    ),
    { width: s, height: s }
  );
}
