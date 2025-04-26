/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React strict mode to reduce hydration errors
  reactStrictMode: false,
  
  // Configure standalone output for Docker deployment
  output: 'standalone',
  
  // Add ESLint configuration to ignore errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
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