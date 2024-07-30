/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/documents/:project/:path*',
        destination: '/documents/:project/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.pdf$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/documents/[path][name][ext]',
      },
    });
    return config;
  },
  output: 'standalone',
};

export default nextConfig;