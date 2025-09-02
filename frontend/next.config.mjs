/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add experimental features for Next.js 15
  experimental: {
    serverComponentsExternalPackages: ['jose'],
  },
  
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/auth/login',
        permanent: false,
      },
    ];
  },
  
  // Add proper caching headers
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
      // Add cache control for auth pages
      {
        source: '/auth/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

export default nextConfig;
