import type { MetadataRoute } from 'next';

// Crawlers that bring no visitors but make the server render pages and share images (AI training
// crawlers and SEO-tool bots). Search engines (Google, Naver, Bing, Daum) and AI search assistants
// that send people here (OAI-SearchBot, ChatGPT-User, PerplexityBot) stay allowed.
const BLOCKED_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'anthropic-ai',
  'CCBot',
  'Bytespider',
  'meta-externalagent',
  'FacebookBot',
  'Amazonbot',
  'Applebot-Extended',
  'Google-Extended',
  'cohere-ai',
  'Diffbot',
  'Omgilibot',
  'ImagesiftBot',
  'Timpibot',
  'AhrefsBot',
  'SemrushBot',
  'MJ12bot',
  'DotBot',
  'DataForSeoBot',
  'BLEXBot',
  'PetalBot',
  'SeekportBot',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: BLOCKED_BOTS, disallow: '/' },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/sns'],
      },
    ],
    sitemap: 'https://www.checkeastpoint.com/sitemap.xml',
  };
}
