import { rewrite } from '@vercel/functions';

// Vercel Edge Middleware — runs BEFORE static file serving.
// Uses @vercel/functions for proper non-Next.js rewrites.
export default function middleware(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Match /{lang} or /{lang}/... patterns
    const langMatch = pathname.match(/^\/(ko|en|ja)(\/(.*))?$/);
    if (!langMatch) return; // Let Vercel handle normally

    const lang = langMatch[1];
    let filepath = langMatch[3] || 'index.html';

    // Skip static assets — let them pass through to CDN
    if (/^(css|js|img|lib|api)(\/|$)/.test(filepath)) {
        return rewrite(new URL('/' + filepath, request.url));
    }

    // Add .html extension if missing
    if (filepath && !filepath.endsWith('.html') && !filepath.includes('.')) {
        filepath += '.html';
    }

    // Rewrite to SSR render function
    const renderUrl = new URL('/api/render', request.url);
    renderUrl.searchParams.set('lang', lang);
    renderUrl.searchParams.set('filepath', filepath);
    
    // Preserve any extra query params (e.g. ?spotId=xxx for blog pages)
    for (const [key, value] of url.searchParams.entries()) {
        if (key !== 'lang' && key !== 'filepath') {
            renderUrl.searchParams.set(key, value);
        }
    }

    return rewrite(renderUrl);
}

export const config = {
    matcher: ['/(ko|en|ja)', '/(ko|en|ja)/(.*)'],
};
