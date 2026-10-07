import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yenepoya.edu.in/iccaqi-2026';
  const currentDate = new Date().toISOString();

  // Single-page conference portal: Only valid, canonical HTTP routes should be declared.
  // URL fragment identifiers (#about, #tracks, etc.) are client-side jump targets and violate XML sitemap specifications.
  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
