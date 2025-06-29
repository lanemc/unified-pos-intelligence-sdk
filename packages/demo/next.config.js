/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@company/pos-intelligence-sdk'],
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_SDK_API_KEY: 'pk_demo_123456789',
    NEXT_PUBLIC_IFRAME_URL: process.env.NEXT_PUBLIC_IFRAME_URL || `http://localhost:${process.env.IFRAME_PORT || 3001}`,
    NEXT_PUBLIC_DEMO_URL: process.env.NEXT_PUBLIC_DEMO_URL || `http://localhost:${process.env.DEMO_PORT || 3000}`,
  },
};

module.exports = nextConfig;