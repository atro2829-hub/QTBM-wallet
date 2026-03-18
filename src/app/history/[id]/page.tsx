
/**
 * تم تعطيل هذا المسار الديناميكي ليتوافق مع نظام "output: export".
 * التطبيق يعتمد حالياً على المسار الثابت /history/detail?id=...
 * هذا الملف موجود فقط لضمان نجاح عملية بناء الهيكل البرمجي.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // نرجع مصفوفة فارغة لأننا نستخدم نظام الكويري بارامز بدلاً من الداينمك روتس
  return [];
}

export default function HistoryIdPage() {
  return null;
}
