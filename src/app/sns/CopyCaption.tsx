'use client';

import { useState } from 'react';

/** Clipboard API, falling back to a hidden textarea where clipboard permission is denied. */
async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand('copy');
    el.remove();
    return ok;
  }
}

export default function CopyCaption({ text }: { text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  return (
    <button
      type="button"
      onClick={async () => {
        setState((await copy(text)) ? 'copied' : 'failed');
        setTimeout(() => setState('idle'), 1500);
      }}
      className="h-10 px-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold"
    >
      {state === 'copied' ? '복사됨 ✓' : state === 'failed' ? '아래 글을 길게 눌러 복사' : '글 복사'}
    </button>
  );
}
