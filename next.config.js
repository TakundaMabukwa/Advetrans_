/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      memoryLimit: 4096
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/
      }
    }
    
    // Fix for Supabase SSR compatibility with Next.js 15
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config
  }
}

module.exports = nextConfig