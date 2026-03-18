/**
 * @fileOverview This file handles dynamic history routes for static export.
 * Since we use ?id= query params for history details, this file provides 
 * a fallback entry to satisfy the 'output: export' build requirement.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // Returns a default static path to allow the build to succeed.
  return [{ id: 'transaction' }];
}

export default function HistoryIdPage() {
  return null;
}
