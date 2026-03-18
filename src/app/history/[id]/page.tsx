
/**
 * @fileOverview توافق التصدير الثابت لـ Next.js (output: export).
 * يتم استخدام دالة generateStaticParams لضمان نجاح بناء تطبيق الأندرويد.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // تزويد معرّف افتراضي لإرضاء محرك البناء الثابت
  return [{ id: 'view' }];
}

export default function StaticHistoryPage() {
  return <div className="hidden" aria-hidden="true" />;
}
