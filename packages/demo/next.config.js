/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@company/pos-intelligence-sdk'],
  env: {
    NEXT_PUBLIC_DEMO_MODE: 'true',
    NEXT_PUBLIC_SDK_API_KEY: 'pk_demo_123456789',
    NEXT_PUBLIC_IFRAME_URL: 'http://localhost:3001',
  },
};

module.exports = nextConfig;