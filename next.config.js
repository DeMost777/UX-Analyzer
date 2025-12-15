/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  // Ensure @vercel/blob is treated as external for server components
  serverExternalPackages: ['@vercel/blob'],
}

module.exports = nextConfig

