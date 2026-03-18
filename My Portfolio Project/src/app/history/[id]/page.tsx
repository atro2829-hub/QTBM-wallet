/**
 * @fileOverview This file handles dynamic history routes for portfolio static export.
 * Satisfies the requirement for 'output: export' in Next.js.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // Provide a default path so static export doesn't fail.
  return [{ id: 'default' }];
}

interface PortfolioHistoryIdPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioHistoryIdPage({ params }: PortfolioHistoryIdPageProps) {
  // Static export requirement placeholder
  return null;
}
