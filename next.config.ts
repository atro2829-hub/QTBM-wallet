
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* تفعيل التصدير الثابت لتحويل المشروع إلى تطبيق أندرويد عبر Capacitor */
  output: 'export',
  trailingSlash: true, 
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true, 
  },
  images: {
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

export default nextConfig;
