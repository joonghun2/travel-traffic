// Starts the Kakao SDK on the static test pages (/event1, /event2), which cannot read env vars themselves.
// Without NEXT_PUBLIC_KAKAO_JS_KEY it does nothing, and those pages share through the phone's share sheet.
export const dynamic = 'force-static';

export function GET() {
  const key = process.env.NEXT_PUBLIC_KAKAO_JS_KEY ?? '';
  const body = key ? `if(window.Kakao&&!window.Kakao.isInitialized())window.Kakao.init(${JSON.stringify(key)});` : '';
  return new Response(body, { headers: { 'Content-Type': 'text/javascript; charset=utf-8' } });
}
