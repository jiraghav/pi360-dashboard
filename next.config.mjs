/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/lawyer',      // subpath
  assetPrefix: '/lawyer',   // static assets load correctly
  reactStrictMode: true,
  output: 'export'
};

export default nextConfig;
