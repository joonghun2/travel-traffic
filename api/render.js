import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

let cachedTranslations = null;
function getTranslations() {
    if (cachedTranslations) return cachedTranslations;
    try {
        const filePath = path.join(process.cwd(), 'js', 'i18n.js');
        const content = fs.readFileSync(filePath, 'utf8');
        const script = `
            const window = {};
            const localStorage = { getItem: () => null, setItem: () => {} };
            const document = { addEventListener: () => {}, querySelectorAll: () => [] };
            ${content}
            return window.translations;
        `;
        cachedTranslations = new Function(script)();
        return cachedTranslations;
    } catch (e) {
        console.error('Failed to parse i18n.js in Node.js', e);
        return { ko: {}, en: {}, ja: {} };
    }
}

export default async function handler(req, res) {
    let { lang, filepath } = req.query;

    if (!lang || !['ko', 'en', 'ja'].includes(lang)) {
        lang = 'ko'; // Default
    }

    if (!filepath || filepath === '') {
        filepath = 'index.html';
    } else if (!filepath.endsWith('.html') && !filepath.includes('.')) {
        filepath += '.html';
    }

    // Prevent directory traversal
    const safePath = path.normalize(filepath).replace(/^(\.\.(\/|\\|$))+/, '');
    const physicalPath = path.join(process.cwd(), safePath);

    if (!physicalPath.startsWith(process.cwd())) {
        return res.status(403).send('Forbidden');
    }

    if (!fs.existsSync(physicalPath)) {
        return res.status(404).send('Page not found');
    }

    let html = fs.readFileSync(physicalPath, 'utf8');

    let title = '';
    let desc = '';
    const translations = getTranslations()[lang] || {};
    
    // Dynamic Pages (Guides)
    const guideMatch = filepath.match(/guides\/guide(\d+)\.html/);
    if (guideMatch) {
        const guideId = guideMatch[1];
        try {
            if (supabase) {
                const { data, error } = await supabase.from('guides').select('ko, en, ja').eq('id', guideId).single();
                if (data && data[lang]) {
                    title = data[lang].title;
                    desc = data[lang].desc;
                }
            }
        } catch (e) {}
        if (!title) {
            title = translations[`guide.${guideId}.title`] || 'Travel Guide';
            desc = translations[`guide.${guideId}.desc`] || '';
        }
    } 
    // Dynamic Pages (Blogs)
    else if (filepath === 'blog_detail.html' && req.query.spotId) {
        try {
            if (supabase) {
                const { data, error } = await supabase.from('blogs').select('ko, en, ja').eq('spotId', req.query.spotId).single();
                if (data && data[lang]) {
                    title = data[lang].title;
                    desc = data[lang].content ? data[lang].content.substring(0, 150).replace(/<[^>]+>/g, '') + '...' : '';
                }
            }
        } catch(e) {}
    } 
    // Static Pages
    else {
        if (filepath === 'index.html') {
            title = translations['hero.title'] ? translations['hero.title'].replace(/<br>/g, ' ').replace(/<[^>]+>/g, '') : 'CheckEastPoint';
            desc = translations['hero.desc'] || '';
        } else if (filepath === 'seoul.html') {
            title = (translations['nav.seoul'] || 'Seoul') + ' | CheckEastPoint';
            desc = translations['seoul.header.desc'] || '';
        } else if (filepath === 'jeju.html') {
            title = (translations['nav.jeju'] || 'Jeju Island') + ' | CheckEastPoint';
            desc = translations['jeju.header.desc'] || '';
        } else if (filepath === 'osaka.html') {
            title = (translations['nav.osaka'] || 'Osaka') + ' | CheckEastPoint';
            desc = translations['osaka.title'] || '';
        } else if (filepath === 'kyoto.html') {
            title = (translations['nav.kyoto'] || 'Kyoto') + ' | CheckEastPoint';
            desc = translations['kyoto.title'] || '';
        } else if (filepath === 'guides.html') {
            title = (translations['guide.hub.title'] || 'Travel Guides') + ' | CheckEastPoint';
            desc = translations['guide.hub.subtitle'] || '';
        }
    }

    if (title) {
        html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
    }
    if (desc) {
        html = html.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta name="description" content="${desc}">`);
        html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']\s*\/?>/i, `<meta property="og:description" content="${desc}">`);
    }

    // Inject lang attribute
    html = html.replace(/<html[^>]*>/i, `<html lang="${lang}">`);

    // --- SSR BODY REPLACEMENTS ---
    // 1. Standard text/HTML replacements
    html = html.replace(/<([a-z0-9]+)\s+([^>]*?)data-i18n=["']([^"']+)["']([^>]*?)>(.*?)<\/\1>/gis, (match, tag, beforeArgs, key, afterArgs, content) => {
        let text = translations[key];
        if (!text) return match;
        return `<${tag} ${beforeArgs}data-i18n="${key}"${afterArgs}>${text}</${tag}>`;
    });

    // 2. Input placeholders
    html = html.replace(/<input\s+([^>]*?)data-i18n=["']([^"']+)["']([^>]*?)>/gis, (match, beforeArgs, key, afterArgs) => {
        let text = translations[key];
        if (!text) return match;
        // remove existing placeholder if exists to avoid duplicates
        let newBefore = beforeArgs.replace(/placeholder=["'][^"']*["']\s*/i, '');
        let newAfter = afterArgs.replace(/placeholder=["'][^"']*["']\s*/i, '');
        return `<input ${newBefore}data-i18n="${key}" placeholder="${text}" ${newAfter}>`;
    });

    // 3. Image sources (data-i18n-src)
    html = html.replace(/<img\s+([^>]*?)data-i18n-src=["']([^"']+)["']([^>]*?)>/gis, (match, beforeArgs, key, afterArgs) => {
        let text = translations[key];
        if (!text) return match;
        let newBefore = beforeArgs.replace(/src=["'][^"']*["']\s*/i, '');
        let newAfter = afterArgs.replace(/src=["'][^"']*["']\s*/i, '');
        return `<img ${newBefore}data-i18n-src="${key}" src="${text}" ${newAfter}>`;
    });

    // 4. Tags generation
    html = html.replace(/<([a-z0-9]+)\s+([^>]*?)data-i18n-tags=["']([^"']+)["']([^>]*?)>(.*?)<\/\1>/gis, (match, tag, beforeArgs, key, afterArgs, content) => {
        let tagsString = translations[key];
        if (!tagsString) return match;
        const tags = tagsString.split(',').filter(t => t.trim() !== '');
        const out = tags.map(t => `<span>${t.startsWith('#') ? t : '#' + t}</span>`).join('');
        return `<${tag} ${beforeArgs}data-i18n-tags="${key}"${afterArgs}>${out}</${tag}>`;
    });

    // Inject hreflang tags
    const baseUrl = 'https://www.checkeastpoint.com';
    let canonicalPath = `/${filepath}`;
    if (filepath === 'index.html') canonicalPath = '/';
    
    let queryString = '';
    const queryEntries = Object.entries(req.query).filter(([k]) => k !== 'lang' && k !== 'filepath');
    if (queryEntries.length > 0) {
        const queryParams = new URLSearchParams();
        queryEntries.forEach(([k, v]) => queryParams.append(k, v));
        queryString = '?' + queryParams.toString();
    }
    
    const cleanUrlEn = `${baseUrl}/en${canonicalPath === '/' ? '' : canonicalPath}${queryString}`.replace(/\/+/g, '/').replace('https:/w', 'https://w');
    const cleanUrlKo = `${baseUrl}/ko${canonicalPath === '/' ? '' : canonicalPath}${queryString}`.replace(/\/+/g, '/').replace('https:/w', 'https://w');
    const cleanUrlJa = `${baseUrl}/ja${canonicalPath === '/' ? '' : canonicalPath}${queryString}`.replace(/\/+/g, '/').replace('https:/w', 'https://w');

    const hreflangTags = `
        <link rel="alternate" hreflang="ko" href="${cleanUrlKo}" />
        <link rel="alternate" hreflang="en" href="${cleanUrlEn}" />
        <link rel="alternate" hreflang="ja" href="${cleanUrlJa}" />
        <link rel="alternate" hreflang="x-default" href="${cleanUrlEn}" />
    `;

    html = html.replace('</head>', `${hreflangTags}\n</head>`);
    
    // Pass current lang to client script
    html = html.replace('</head>', `<script>window.currentLang = "${lang}"; localStorage.setItem('travel_traffic_lang', "${lang}");</script>\n</head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
}
