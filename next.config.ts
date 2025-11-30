/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  serverExternalPackages: ['mapbox-gl'],
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
    };
    
    config.cache = false;
    config.parallelism = 1;
    
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: false,
    };
    
    return config;
  },
};

module.exports = nextConfig;

