
/**
 * @fileOverview Static export compatibility for Next.js.
 * This file ensures that dynamic routes do not break the "output: export" build process.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  // Provide a default parameter to satisfy the static export engine.
  return [{ id: 'view' }];
}

export default function StaticHistoryIdPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" aria-hidden="true">
      <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
        Redirecting to safe route...
      </div>
    </div>
  );
}
