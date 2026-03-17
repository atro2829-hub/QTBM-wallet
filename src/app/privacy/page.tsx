
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">سياسة الخصوصية</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8 pb-10">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-4 bg-primary/10 text-primary rounded-[2rem]">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h2 className="text-2xl font-black">أمنك هو أولويتنا</h2>
              <p className="text-sm text-muted-foreground font-medium">نحن نلتزم بحماية بياناتك المالية والشخصية بأعلى معايير الأمان العالمية.</p>
            </div>

            <section className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-xl mt-1"><Lock className="h-4 w-4" /></div>
                <div className="space-y-1">
                  <h3 className="font-black text-sm">تشفير البيانات</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">تتم معالجة جميع المعاملات والبيانات الشخصية عبر قنوات مشفرة (End-to-End Encryption) لمنع أي وصول غير مصرح به.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-xl mt-1"><Eye className="h-4 w-4" /></div>
                <div className="space-y-1">
                  <h3 className="font-black text-sm">شفافية المعلومات</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">لا نقوم بمشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية. يتم استخدام البيانات فقط لتحسين تجربتك وتأمين عملياتك المالية.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-muted rounded-xl mt-1"><FileText className="h-4 w-4" /></div>
                <div className="space-y-1">
                  <h3 className="font-black text-sm">سجلات المعاملات</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">يتم الاحتفاظ بسجلات المعاملات لأغراض التدقيق القانوني وحماية حقوقك المالية فقط.</p>
                </div>
              </div>
            </section>

            <div className="p-6 bg-muted/50 rounded-3xl border border-dashed">
              <p className="text-[10px] font-bold text-center text-muted-foreground leading-relaxed">
                باستخدامك لتطبيق QTBM Wallet، فإنك توافق على شروط الخدمة وسياسة الخصوصية المذكورة أعلاه. نحن نحتفظ بالحق في تحديث هذه السياسة دورياً لتعزيز مستوى الأمان.
              </p>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
