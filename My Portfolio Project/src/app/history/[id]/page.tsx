/**
 * تم تحويل هذا الملف إلى Server Component ثابت ليتوافق مع "output: export".
 * بما أننا نستخدم الآن /history/detail?id=... لعرض التفاصيل، 
 * فإن هذا المسار أصبح غير مستخدم تقنياً، ولكن يجب أن يظل موجوداً 
 * لنجاح عملية بناء الهيكل البرمجي.
 */

export const dynamicParams = false;

export async function generateStaticParams() {
  // نرجع مصفوفة فارغة لأننا لا نحتاج لتوليد صفحات لهذا المسار الديناميكي
  // ونعتمد بدلاً من ذلك على المسار الثابت /history/detail
  return [];
}

export default function TransactionRedirectPage() {
  return null;
}
