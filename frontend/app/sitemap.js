export default function sitemap() {
  const baseUrl = 'https://www.rebornbiz.co.kr';

  const staticRoutes = [
    '',
    '/about',
    '/calculator',
    '/magazine',
    '/market_analysis',
    '/policy',
    '/simulation',
    '/statistics',
    '/tax_cal',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  return [...staticRoutes];
}
