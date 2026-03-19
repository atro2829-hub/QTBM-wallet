import React from 'react';

/**
 * @fileOverview صفحة تفاصيل المعاملة المتوافقة مع التصدير الثابت.
 */

export async function generateStaticParams() {
  return [{ id: 'default' }];
}

export default function StaticHistoryIdPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
        جاري جلب بيانات المعاملة...
      </div>
    </div>
  );
}