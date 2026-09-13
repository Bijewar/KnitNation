const path = require('path');
require('dotenv').config();

/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  productionBrowserSourceMaps: false,

  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.resolve(__dirname);

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        async_hooks: false,
        fs: false,
        inspector: false,
        diagnostics_channel: false,
        child_process: false,
      };
    }

    return config;
  },

  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  reactStrictMode: true,
  trailingSlash: true,
};

module.exports = nextConfig;
