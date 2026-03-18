
/**
 * تم تعديل هذا الملف لإصلاح خطأ التصدير للأندرويد (Static Export).
 * لا يمكن استخدام "use client" مع "generateStaticParams" في نفس الملف.
 * بما أن التطبيق يستخدم الآن /history/detail?id=... لعرض التفاصيل، 
 * فإن هذا الملف يعمل فقط كجسر تقني لضمان نجاح عملية البناء.
 */

export async function generateStaticParams() {
  // نرجع مصفوفة فارغة لتعطيل توليد الصفحات الديناميكية أثناء البناء، 
  // مما يسمح لـ Next.js بإتمام التصدير الثابت بنجاح.
  return [];
}

export default function TransactionRedirectPage() {
  return null;
}
