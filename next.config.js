/** @type {import('next').NextConfig} */
const nextConfig = {
  // Permite acesso externo
  experimental: {
    externalDir: true,
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Configura CORS para desenvolvimento
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig