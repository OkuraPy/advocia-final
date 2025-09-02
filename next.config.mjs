/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gczqdsfsjglotowcxobe.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  webpack: (config, { isServer }) => {
    // Configurações para react-pdf
    config.resolve.alias.canvas = false;
    
    // Ignora pdf-parse no cliente e evita erro de arquivo não encontrado
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    
    // Corrige problema com pdf-parse no servidor
    if (isServer) {
      config.externals = [...(config.externals || []), 'pdf-parse']
    }
    
    // Ignora arquivos de teste do pdf-parse
    config.module.rules.push({
      test: /test\/data\/.*\.pdf$/,
      loader: 'null-loader'
    })
    
    return config
  },
  
  // Configurações experimentais
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'canvas']
  }
};

export default nextConfig;