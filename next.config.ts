
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* تفعيل التصدير الثابت لتحويل المشروع إلى تطبيق أندرويد عبر Capacitor */
  output: 'export',
  trailingSlash: true, // يضمن توافق الروابط داخل متصفحات الأندرويد
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true, // ضروري جداً للتصدير الثابت (Static Export) ليعمل داخل الأندرويد
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
