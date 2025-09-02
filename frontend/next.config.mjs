// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://e-learning-seven-zeta.vercel.app/:path*', // Replace with your backend URL
      },
    ]
  },
}

export default nextConfig 