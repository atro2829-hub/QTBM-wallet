
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Clock, TrendingUp, CheckCircle2, Loader2, Sparkles, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

function CountdownTimer({ endDate }: { endDate: string }) {
  const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(timer);
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!timeLeft) return <Loader2 className="h-4 w-4 animate-spin opacity-20" />;

  return (
    <div className="grid grid-cols-4 gap-2 text-center">
       <div className="bg-primary/10 p-2 rounded-xl"><p className="text-sm font-black">{timeLeft.days}</p><p className="text-[8px] font-bold opacity-60">يوم</p></div>
       <div className="bg-primary/10 p-2 rounded-xl"><p className="text-sm font-black">{timeLeft.hours}</p><p className="text-[8px] font-bold opacity-60">ساعة</p></div>
       <div className="bg-primary/10 p-2 rounded-xl"><p className="text-sm font-black">{timeLeft.minutes}</p><p className="text-[8px] font-bold opacity-60">دقيقة</p></div>
       <div className="bg-primary/10 p-2 rounded-xl"><p className="text-sm font-black">{timeLeft.seconds}</p><p className="text-[8px] font-bold opacity-60">ثانية</p></div>
    </div>
  );
}

export default function ActiveInvestmentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();

  const investQuery = useMemoFirebase(() => 
    user ? query(collection(db, 'users', user.uid, 'investments'), orderBy('createdAt', 'desc')) : null
  , [db, user]);

  const { data: investments, isLoading } = useCollection(investQuery);

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">استثماراتي النشطة</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="p-6 space-y-6 flex-1 overflow-y-auto pb-20">
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : !investments || investments.length === 0 ? (
          <div className="text-center py-20 opacity-30 space-y-4">
             <TrendingUp className="h-20 w-20 mx-auto" />
             <p className="font-black">لا توجد استثمارات حالية</p>
             <Button variant="outline" className="rounded-xl font-black" onClick={() => router.push('/dashboard/invest')}>استعرض الخطط</Button>
          </div>
        ) : (
          <div className="space-y-6">
            {investments.map((inv) => (
              <Card key={inv.id} className="rounded-[2.5rem] border-none shadow-2xl glass-morphism overflow-hidden relative">
                {inv.status === 'active' && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none animate-pulse">نشط</Badge>
                  </div>
                )}
                <CardContent className="p-8 space-y-6">
                   <div className="flex justify-between items-start">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-muted-foreground">الخطة المختارة</p>
                         <h3 className="text-xl font-black">{inv.planName}</h3>
                      </div>
                      <div className="p-4 bg-primary/5 rounded-[1.5rem]">
                         <TrendingUp className="h-6 w-6 text-primary" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6 bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase opacity-60">رأس المال</p>
                         <p className="text-lg font-black">{inv.amount.toLocaleString()} {inv.currency}</p>
                      </div>
                      <div className="space-y-1 text-left">
                         <p className="text-[10px] font-black uppercase text-primary">العائد المتوقع</p>
                         <p className="text-lg font-black text-primary">+{inv.expectedReturn?.toLocaleString()} {inv.currency}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                         <Clock className="h-4 w-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">الوقت المتبقي لانتهاء الدورة</span>
                      </div>
                      <CountdownTimer endDate={inv.endDate} />
                   </div>

                   <div className="flex justify-between items-center pt-2 text-[10px] font-bold text-muted-foreground">
                      <span>تاريخ البدء: {new Date(inv.startDate).toLocaleDateString()}</span>
                      <span>تاريخ الاستحقاق: {new Date(inv.endDate).toLocaleDateString()}</span>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
