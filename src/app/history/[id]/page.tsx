
"use client";

import React from 'react';

/**
 * توافق التصدير الثابت لـ Next.js 15.
 * تم تحويل الصفحة إلى Client Component لضمان استقرار عملية البناء.
 */
export default function StaticHistoryIdPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
        جاري جلب تفاصيل المعاملة...
      </div>
    </div>
  );
}
