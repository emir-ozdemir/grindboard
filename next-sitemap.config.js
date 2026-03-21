/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://grindboard.org',
  generateRobotsTxt: false, // robots.txt is managed manually
  exclude: [
    '/*/dashboard',
    '/*/pomodoro',
    '/*/schedule',
    '/*/topics',
    '/*/notes',
    '/*/stats',
    '/*/exams',
    '/*/goals',
    '/*/settings',
    '/*/subscribe',
    '/*/login',
    '/*/register',
    '/*/forgot-password',
    '/*/reset-password',
  ],
  additionalPaths: async () => [
    { loc: '/', changefreq: 'monthly', priority: 1.0 },
    { loc: '/tr', changefreq: 'monthly', priority: 1.0 },
    { loc: '/en', changefreq: 'monthly', priority: 1.0 },
    { loc: '/tr/privacy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/en/privacy', changefreq: 'yearly', priority: 0.3 },
    { loc: '/tr/terms', changefreq: 'yearly', priority: 0.3 },
    { loc: '/en/terms', changefreq: 'yearly', priority: 0.3 },
    { loc: '/tr/contact', changefreq: 'yearly', priority: 0.5 },
    { loc: '/en/contact', changefreq: 'yearly', priority: 0.5 },
  ],
};
