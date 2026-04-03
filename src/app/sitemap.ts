import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXTAUTH_URL || 'https://dailytraveltalk.app';
const locales = ['ko', 'en', 'ja', 'zh', 'de'];

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  // Landing pages for each locale
  const landingPages = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 1.0,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}`]),
      ),
    },
  }));

  // Dashboard pages
  const dashboardPages = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}/dashboard`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.9,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/dashboard`]),
      ),
    },
  }));

  // History pages
  const historyPages = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}/history`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.7,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/history`]),
      ),
    },
  }));

  // Statistics pages
  const statisticsPages = locales.map((locale) => ({
    url: `${BASE_URL}/${locale}/statistics`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.6,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, `${BASE_URL}/${l}/statistics`]),
      ),
    },
  }));

  return [
    // Root
    {
      url: BASE_URL,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...landingPages,
    ...dashboardPages,
    ...historyPages,
    ...statisticsPages,
  ];
}
