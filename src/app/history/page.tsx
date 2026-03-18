
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, ShoppingBag, Loader2, ChevronLeft, FileText, Download, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function HistoryPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState(format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(format(new Date(), 'yyyy-MM-dd'));

  const transactionsQuery = useMemoFirebase(() => 
    user ? query(collection(db, 'users', user.uid, 'transactions'), orderBy('createdAt', 'desc')) : null
  , [db, user]);

  const { data: transactions, isLoading } = useCollection(transactionsQuery);

  const getIcon = (type: string) => {
    switch(type) {
      case 'send': return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'receive': return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'deposit': return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'withdraw': return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'purchase': return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'failed':
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleDownloadStatement = () => {
    router.push(`/history/statement?from=${dateFrom}&to=${dateTo}`);
    setIsStatementOpen(false);
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x pb-24 shadow-2xl" dir="rtl">
      <header className="p-6 pb-2 flex flex-col gap-4 sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">سجل المعاملات</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
            <ArrowLeft className="h-6 w-6 rotate-180" />
          </Button>
        </div>
        
        <Dialog open={isStatementOpen} onOpenChange={setIsStatementOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full rounded-2xl h-12 gap-2 font-black border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
              <FileText className="h-4 w-4 text-primary" />
              استخراج كشف حساب
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2rem] w-[90%] max-w-sm" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-black">كشف الحساب الرقمي</DialogTitle>
              <DialogDescription className="text-right font-bold">اختر الفترة الزمنية المراد عرضها في التقرير.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2 text-right">
                <Label className="text-xs font-black">من تاريخ</Label>
                <div className="relative">
                   <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="pr-10 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Label className="text-xs font-black">إلى تاريخ</Label>
                <div className="relative">
                   <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="pr-10 rounded-xl" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleDownloadStatement} className="w-full h-12 rounded-xl font-black gap-2">
                <Download className="h-4 w-4" />
                عرض وتحميل كشف الحساب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <main className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-primary h-10 w-10" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">جاري استرجاع سجلاتك...</p>
          </div>
        ) : !transactions || transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground opacity-30 text-center px-10 gap-4">
            <Clock className="h-20 w-20" />
            <div className="space-y-1">
              <p className="font-black text-lg">لا توجد معاملات</p>
              <p className="text-xs font-bold leading-relaxed">لم تقم بإجراء أي عمليات مالية بعد. ابدأ بشحن رصيدك الآن.</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {transactions.map((tx) => (
              <div 
                key={tx.id} 
                className="glass-morphism rounded-3xl p-4 flex items-center gap-4 active:scale-95 transition-all cursor-pointer group hover:bg-white/90 dark:hover:bg-black/50"
                onClick={() => router.push(`/history/${tx.id}`)}
              >
                <div className="p-3 bg-background rounded-2xl shadow-sm shrink-0 group-hover:rotate-12 transition-transform">
                  {getIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black truncate text-sm tracking-tight">{tx.description}</h3>
                    <span className={cn(
                      "font-black text-sm tabular-nums",
                      tx.type === 'send' || tx.type === 'purchase' || tx.type === 'withdraw' ? "text-red-500" : "text-green-500"
                    )}>
                      {tx.type === 'send' || tx.type === 'purchase' || tx.type === 'withdraw' ? '-' : '+'}
                      {tx.amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-muted-foreground opacity-70">
                        {tx.createdAt?.seconds ? format(new Date(tx.createdAt.seconds * 1000), 'dd MMM • HH:mm') : 'جاري المعالجة'}
                      </span>
                      <span className="text-[9px] font-black text-primary uppercase">{tx.currency}</span>
                    </div>
                    <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest", getStatusColor(tx.status))}>
                      {tx.status}
                    </div>
                  </div>
                </div>
                <ChevronLeft className="h-4 w-4 text-muted-foreground/30" />
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
