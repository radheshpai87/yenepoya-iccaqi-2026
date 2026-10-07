import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yenepoya.edu.in/iccaqi-2026';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/portal-admin-icc2026/',
          '/api/',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Bytespider',
          'cohere-ai',
        ],
        allow: '/',
        disallow: [
          '/portal-admin-icc2026/',
          '/api/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
