/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode to reduce hydration errors
  reactStrictMode: false,
  
  // Configure standalone output for Docker deployment
  output: 'standalone',
  
  // Add redirects configuration
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
}

module.exports = nextConfig 