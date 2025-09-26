/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ✅ don’t fail the production build on ESLint issues
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ✅ don’t fail the production build on TS type errors
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;