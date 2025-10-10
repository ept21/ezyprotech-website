module.exports = {
    siteUrl: process.env.SITE_URL,
    generateRobotsTxt: true,
    sitemapSize: 5000,
    exclude: ['/api/*','/preview/*'],
    robotsTxtOptions: { policies: [{ userAgent: '*', allow: '/' }] },
}
