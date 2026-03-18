
/**
 * @fileOverview صفحة المسار الديناميكي القديم.
 * تم تعطيل هذا المسار برمجياً ليتوافق مع نظام "output: export" المطلوب للأندرويد.
 * التطبيق يستخدم حالياً المسار الثابت المتوافق: /history/detail?id=...
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // نرجع مصفوفة فارغة لمنع Next.js من محاولة توليد صفحات ديناميكية أثناء البناء
  // هذا يحل خطأ: Page is missing generateStaticParams()
  return [];
}

export default function HistoryIdPage() {
  return null;
}
