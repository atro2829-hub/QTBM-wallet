
/**
 * @fileOverview This file handles dynamic history routes for static export.
 * It provides a fallback path to satisfy 'output: export' requirements.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // توفير مسار افتراضي لكي تنجح عملية بناء المشروع الثابت
  return [{ id: 'default' }];
}

export default function StaticHistoryIdPage() {
  // التطبيق يستخدم الآن /history/detail?id=... للتوافق الكامل مع الأندرويد
  return null;
}
