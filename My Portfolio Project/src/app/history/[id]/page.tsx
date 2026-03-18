/**
 * @fileOverview This file handles dynamic history routes for portfolio static export.
 * Satisfies the requirement for 'output: export' in Next.js.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: 'transaction' }];
}

export default function PortfolioHistoryIdPage() {
  return null;
}
