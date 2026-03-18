
/**
 * @fileOverview Static export compatibility for Next.js dynamic routes.
 * This file prevents "Internal Server Error" during 'npm run build'.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // Provide a fallback ID to satisfy the static export requirements.
  return [{ id: 'default' }];
}

export default function StaticHistoryIdPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" aria-hidden="true">
      <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
        Redirecting to transaction details...
      </div>
    </div>
  );
}
