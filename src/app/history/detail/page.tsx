
"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Loader2,
  Copy,
  Hash,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

function TransactionDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const transactionId = searchParams.get('id');

  const transactionRef = useMemoFirebase(() => 
    user && transactionId ? doc(db, 'users', user.uid, 'transactions', transactionId) : null
  , [db, user, transactionId]);

  const { data: tx, isLoading } = useDoc(transactionRef);

  const copyId = () => {
    if (transactionId) {
      navigator.clipboard.writeText(transactionId);
      toast({ title: "تم النسخ", description: "تم نسخ المعرف المرجعي بنجاح." });
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  if (!tx || !transactionId) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-4">
      <AlertCircle className="h-16 w-16 text-muted-foreground opacity-20" />
      <h2 className="text-xl font-black">المعاملة غير موجودة</h2>
      <Button onClick={() => router.push('/history')}>العودة للسجل</Button>
    </div>
  );

  const getStatusIcon = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'approved': return <CheckCircle2 className="h-12 w-12 text-green-500" />;
      case 'pending': return <Clock className="h-12 w-12 text-orange-500 animate-pulse" />;
      case 'failed':
      case 'rejected': return <XCircle className="h-12 w-12 text-red-500" />;
      default: return <AlertCircle className="h-12 w-12 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case 'send': return 'حوالة صادرة';
      case 'receive': return 'حوالة واردة';
      case 'deposit': return 'إيداع رصيد';
      case 'withdraw': return 'سحب رصيد';
      case 'purchase': return 'شراء خدمة';
      default: return 'معاملة مالية';
    }
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x pb-10" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">تفاصيل المعاملة</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="p-6 space-y-6">
        <div className="flex flex-col items-center text-center py-6 gap-4">
          <div className="p-4 bg-background rounded-[2.5rem] shadow-2xl">
            {getStatusIcon(tx.status)}
          </div>
          <div className="space-y-1">
            <h2 className={tx.type === 'send' || tx.type === 'purchase' || tx.type === 'withdraw' ? "text-3xl font-black text-red-500" : "text-3xl font-black text-green-500"}>
              {tx.type === 'send' || tx.type === 'purchase' || tx.type === 'withdraw' ? '-' : '+'}
              {tx.amount?.toLocaleString()} {tx.currency}
            </h2>
            <Badge variant="outline" className="font-black uppercase tracking-widest">{getTypeLabel(tx.type)}</Badge>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl glass-morphism overflow-hidden">
          <CardContent className="p-6 space-y-5">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-bold">التاريخ</span>
              </div>
              <span className="text-sm font-black">
                {tx.createdAt?.seconds ? format(new Date(tx.createdAt.seconds * 1000), 'MMM dd, yyyy HH:mm') : 'جاري المعالجة'}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="text-xs font-bold">الرقم المرجعي</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase">{transactionId?.slice(0, 12)}...</span>
                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={copyId}><Copy className="h-3 w-3" /></Button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wallet className="h-4 w-4" />
                <span className="text-xs font-bold">العملة</span>
              </div>
              <span className="text-sm font-black">{tx.currency}</span>
            </div>

            <div className="space-y-2 pt-2">
               <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">الوصف / التفاصيل</span>
               <div className="text-sm font-bold leading-relaxed bg-primary/5 p-4 rounded-2xl border border-primary/10">
                 {tx.description}
                 {tx.recipientName && <span className="block mt-1 text-primary">إلى: {tx.recipientName}</span>}
                 {tx.senderName && <span className="block mt-1 text-green-600">من: {tx.senderName}</span>}
                 {tx.method && <span className="block mt-1 text-xs opacity-60">عبر: {tx.method}</span>}
               </div>
            </div>
          </CardContent>
        </Card>

        {tx.status?.toLowerCase() === 'pending' && (
          <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-[2rem] flex gap-4 items-start">
            <AlertCircle className="h-6 w-6 text-orange-600 shrink-0" />
            <div className="space-y-1">
              <p className="font-black text-sm text-orange-700">تحت المراجعة</p>
              <p className="text-xs font-medium text-orange-600/80 leading-relaxed">
                هذه المعاملة معلقة حالياً وتنتظر موافقة القسم المختص. سيتم تحديث الرصيد بمجرد اكتمال المراجعة.
              </p>
            </div>
          </div>
        )}

        <Button 
          variant="secondary" 
          className="w-full h-14 rounded-2xl font-black gap-2 mt-4"
          onClick={() => router.push('/dashboard')}
        >
          العودة للرئيسية
        </Button>
      </main>
    </div>
  );
}

export default function TransactionDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <TransactionDetailContent />
    </Suspense>
  );
}
