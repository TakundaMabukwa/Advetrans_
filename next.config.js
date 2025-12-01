/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: false,
  turbopack: {
    memoryLimit: 512
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackMemoryOptimizations: true,
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      '@mui/material',
      '@mui/x-charts',
      'date-fns'
    ],
  },
  webpack: (config, { dev, isServer }) => {
    config.optimization = {
      ...config.optimization,
      minimize: true,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            priority: 40,
            enforce: true,
          },
          lib: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
              return `npm.${packageName.replace('@', '')}`;
            },
            priority: 30,
          },
        },
      },
    };
    
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/
      }
    }
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
      };
    }
    
    config.module = {
      ...config.module,
      noParse: /mapbox-gl\.js$/,
    };
    
    return config
  }
}

module.exports = nextConfig