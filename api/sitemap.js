import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
let supabase = null;
if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
    const baseUrl = 'https://www.checkeastpoint.com';
    const langs = ['en', 'ko', 'ja'];
    const staticPages = [
        '', // index
        'seoul.html',
        'jeju.html',
        'osaka.html',
        'kyoto.html',
        'guides.html',
        'faq.html',
        'privacy.html',
        'terms.html',
        'blog_list.html',
        'event1/index.html',
        'admin.html',
        'admin_blog.html'
    ];

    let urls = [];

    // Add static pages
    staticPages.forEach(page => {
        langs.forEach(lang => {
            urls.push(`${baseUrl}/${lang}${page ? '/' + page : ''}`);
        });
    });

    if (supabase) {
        // Add dynamic guide pages
        try {
            const { data: guides } = await supabase.from('guides').select('id');
            if (guides) {
                guides.forEach(g => {
                    langs.forEach(lang => urls.push(`${baseUrl}/${lang}/guides/guide${g.id}.html`));
                });
            }
        } catch (e) {}

        // Add dynamic blog pages
        try {
            const { data: blogs } = await supabase.from('blogs').select('spotId');
            if (blogs) {
                blogs.forEach(b => {
                    langs.forEach(lang => urls.push(`${baseUrl}/${lang}/blog_detail.html?spotId=${b.spotId}`));
                });
            }
        } catch (e) {}
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map(url => `  <url>\n    <loc>${url}</loc>\n  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send(sitemap);
}
