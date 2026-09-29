import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.checkeastpoint.com';
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'hourly',
      priority: 1.0,
      alternates: {
        languages: {
          ko: `${baseUrl}/`,
          en: `${baseUrl}/?lang=en`,
          ja: `${baseUrl}/?lang=ja`,
        },
      },
    },
    {
      url: `${baseUrl}/play`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          ko: `${baseUrl}/play`,
          en: `${baseUrl}/play?lang=en`,
          ja: `${baseUrl}/play?lang=ja`,
        },
      },
    },
    {
      url: `${baseUrl}/event1/index.html`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          ko: `${baseUrl}/event1/index.html?lang=ko`,
          en: `${baseUrl}/event1/index.html?lang=en`,
          ja: `${baseUrl}/event1/index.html?lang=ja`,
        },
      },
    },
    {
      url: `${baseUrl}/event2/index.html`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: {
        languages: {
          ko: `${baseUrl}/event2/index.html?lang=ko`,
          en: `${baseUrl}/event2/index.html?lang=en`,
          ja: `${baseUrl}/event2/index.html?lang=ja`,
        },
      },
    },
  ];
}
