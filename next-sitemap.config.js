// ============================================================================
// next-sitemap.config.js — Sitemap dinâmico (Onda 12, 2026-06-27)
// ============================================================================
// Gera sitemap.xml e robots.txt com todas as rotas públicas:
//   - /, /explore, /tags/*, /groups/*, /library/*
//   - Posts e artigos via dynamic sitemap (DB query)
// ============================================================================

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://cabaladoscaminhos.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/onboarding', '/login', '/register', '/personal'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/api', '/onboarding', '/login', '/register', '/personal'],
      },
    ],
  },
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/admin/*', '/api/*', '/onboarding', '/login', '/register'],
  transform: async (config, path) => {
    // Rotas com prioridade alta
    const highPriority = [
      '/',
      '/explore',
      '/validacao',
    ];
    const mediumPriority = [
      '/feed',
      '/library',
      '/groups',
      '/notifications',
    ];
    const tagMatch = path.match(/^\/tags\/[^\/]+$/);

    if (highPriority.includes(path)) {
      return { loc: path, changefreq: 'daily', priority: 1.0, lastmod: new Date().toISOString() };
    }
    if (mediumPriority.includes(path)) {
      return { loc: path, changefreq: 'daily', priority: 0.8, lastmod: new Date().toISOString() };
    }
    if (tagMatch) {
      return { loc: path, changefreq: 'weekly', priority: 0.7, lastmod: new Date().toISOString() };
    }
    return { loc: path, changefreq: config.changefreq, priority: config.priority, lastmod: new Date().toISOString() };
  },
  // Sitemap dinâmico adicional com DB content
  // Será combinado com o estático na geração via next-sitemap
  additionalPaths: async (config) => {
    const out = [];

    // Se DATABASE_URL definida, puxa posts, artigos e grupos para o sitemap
    if (process.env.DATABASE_URL) {
      try {
        const { PrismaClient } = require('@prisma/client'); // eslint-disable-line @typescript-eslint/no-require-imports
        const prisma = new PrismaClient();

        const [posts, articles, groups] = await Promise.all([
          prisma.post.findMany({
            where: { deletedAt: null },
            select: { id: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 5000,
          }).catch(() => []),
          prisma.article.findMany({
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 5000,
          }).catch(() => []),
          prisma.group.findMany({
            where: { isPublic: true },
            select: { slug: true, updatedAt: true },
            orderBy: { updatedAt: 'desc' },
            take: 1000,
          }).catch(() => []),
        ]);

        posts.forEach((p) => {
          out.push({
            loc: `/post/${p.id}`,
            changefreq: 'weekly',
            priority: 0.6,
            lastmod: p.updatedAt,
          });
        });

        articles.forEach((a) => {
          out.push({
            loc: `/library/${a.slug}`,
            changefreq: 'monthly',
            priority: 0.7,
            lastmod: a.updatedAt,
          });
        });

        groups.forEach((g) => {
          out.push({
            loc: `/groups/${g.slug}`,
            changefreq: 'daily',
            priority: 0.7,
            lastmod: g.updatedAt,
          });
        });

        await prisma.$disconnect();
      } catch (err) {
        console.warn('[next-sitemap] DB query failed:', err);
      }
    }

    return out;
  },
};
