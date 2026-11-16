import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/pricing', '/order', '/terms', '/privacy'],
        disallow: ['/account/', '/admin/'],
      },
    ],
    sitemap: '/sitemap.xml',
  };
}
