/**
 * @fileOverview This file handles dynamic history routes for static export.
 * Neutralized to satisfy 'output: export' requirements.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // Provide a default path so static export succeeds.
  return [{ id: 'default' }];
}

export default function StaticHistoryIdPage() {
  // The app uses /history/detail?id=... for better compatibility.
  return null;
}
