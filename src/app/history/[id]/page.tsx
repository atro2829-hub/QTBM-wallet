
/**
 * @fileOverview Static export compatibility for history routes.
 * Using generateStaticParams to satisfy Next.js 'output: export' requirements.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // تزويد النظام بمسار افتراضي لنجاح عملية البناء الثابت
  return [{ id: 'view' }];
}

export default function StaticHistoryPage() {
  return null;
}
