/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skeleton mínimo (v0.0.4-T1.2). Será expandido em T1.3+ quando o código B2C for movido.
  reactStrictMode: true,
  // Transpile os packages locais do monorepo
  transpilePackages: [
    '@akasha/types',
    '@akasha/core-astrology',
    '@akasha/core-cabala',
    '@akasha/core-odus',
    '@akasha/core-tantra',
  ],
};

module.exports = nextConfig;
