
/**
 * @fileOverview Portfolio version static export compatibility.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: 'view' }];
}

export default function PortfolioStaticHistoryIdPage() {
  return <div className="hidden" aria-hidden="true" />;
}
