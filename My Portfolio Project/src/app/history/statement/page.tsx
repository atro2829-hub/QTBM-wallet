
"use client";

import React, { useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, 
  Printer, 
  Wallet, 
  Clock, 
  User, 
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { AppLogo } from '@/components/layout/AppLogo';

function PortfolioStatementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const printRef = useRef<HTMLDivElement>(null);

  const dateFrom = searchParams.get('from');
  const dateTo = searchParams.get('to');

  const userProfileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile } = useDoc(userProfileRef);

  const transactionsQuery = useMemoFirebase(() => 
    user ? query(collection(db, 'users', user.uid, 'transactions'), orderBy('createdAt', 'desc')) : null
  , [db, user]);

  const { data: allTransactions, isLoading } = useCollection(transactionsQuery);

  const transactions = allTransactions?.filter(tx => {
    if (!tx.createdAt?.seconds || !dateFrom || !dateTo) return true;
    const txDate = new Date(tx.createdAt.seconds * 1000);
    try {
      return isWithinInterval(txDate, {
        start: startOfDay(parseISO(dateFrom)),
        end: endOfDay(parseISO(dateTo))
      });
    } catch (e) {
      return true;
    }
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8" dir="rtl">
      <div className="print:hidden mb-8">
        <Button onClick={() => router.back()} variant="ghost" className="gap-2">
          <ArrowRight className="h-4 w-4" /> العودة
        </Button>
      </div>
      <main ref={printRef} className="max-w-4xl mx-auto border-4 border-primary/10 p-10 rounded-[3rem] shadow-2xl">
        <div className="flex justify-between items-start border-b-2 border-primary/20 pb-8">
          <AppLogo iconOnly className="h-16 w-16" />
          <div className="text-left">
            <h1 className="text-2xl font-black">كشف الحساب الرقمي</h1>
            <p className="text-xs text-muted-foreground">UID: {user?.uid}</p>
          </div>
        </div>
        
        <div className="mt-10 space-y-6">
          <div className="bg-slate-50 p-6 rounded-3xl flex justify-between">
            <div><p className="text-[10px] font-black opacity-50 uppercase">صاحب الحساب</p><p className="font-black">{profile?.fullName}</p></div>
            <div><p className="text-[10px] font-black opacity-50 uppercase">الفترة</p><p className="font-black">{dateFrom} - {dateTo}</p></div>
          </div>

          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b-2">
                <th className="py-4 text-xs font-black uppercase opacity-50">التاريخ</th>
                <th className="py-4 text-xs font-black uppercase opacity-50">الوصف</th>
                <th className="py-4 text-xs font-black uppercase opacity-50">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {transactions?.map((tx) => (
                <tr key={tx.id} className="border-b border-slate-100">
                  <td className="py-4 text-xs font-bold">{tx.createdAt?.seconds ? format(new Date(tx.createdAt.seconds * 1000), 'yyyy-MM-dd') : '-'}</td>
                  <td className="py-4 text-xs font-black">{tx.description}</td>
                  <td className={`py-4 text-xs font-black ${tx.type === 'send' ? 'text-red-500' : 'text-green-600'}`}>
                    {tx.type === 'send' ? '-' : '+'}{tx.amount?.toLocaleString()} {tx.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default function PortfolioAccountStatementPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <PortfolioStatementContent />
    </Suspense>
  );
}
