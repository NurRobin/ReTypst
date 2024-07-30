/** @type {import('next').NextConfig} */
const nextConfig = {
    async rewrites() {
      return [
        {
          source: '/documents/:path*',
          destination: '/documents/:path*',
        },
      ];
    },
    webpack: (config) => {
      config.module.rules.push({
        test: /\.pdf$/,
        type: 'asset/resource',
        generator: {
          filename: 'static/documents/[name][ext]',
        },
      });
      return config;
    },
    output: 'standalone',
  };
  
  export default nextConfig;
  