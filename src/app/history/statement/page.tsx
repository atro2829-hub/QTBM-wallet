
"use client";

import React, { useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Printer, Download, Wallet, Clock, User, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, where, doc } from 'firebase/firestore';
import { format, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { AppLogo } from '@/components/layout/AppLogo';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

export default function AccountStatementPage() {
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

  // Filter transactions by date range
  const transactions = allTransactions?.filter(tx => {
    if (!tx.createdAt?.seconds || !dateFrom || !dateTo) return true;
    const txDate = new Date(tx.createdAt.seconds * 1000);
    return isWithinInterval(txDate, {
      start: startOfDay(parseISO(dateFrom)),
      end: endOfDay(parseISO(dateTo))
    });
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900" dir="rtl">
      {/* Tool Bar - Hidden in Print */}
      <div className="print:hidden p-4 flex items-center justify-between border-b bg-slate-50 sticky top-0 z-50">
        <div className="flex gap-2">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowRight className="h-6 w-6" />
           </Button>
           <h1 className="text-lg font-black mt-1.5">كشف الحساب الرقمي</h1>
        </div>
        <div className="flex gap-2">
           <Button size="sm" onClick={handlePrint} className="rounded-xl gap-2 font-black">
              <Printer className="h-4 w-4" />
              طباعة التقرير
           </Button>
        </div>
      </div>

      {/* Statement Content */}
      <main ref={printRef} className="max-w-4xl mx-auto p-8 md:p-12 space-y-10 print:p-0">
        
        {/* Header Section */}
        <div className="flex justify-between items-start border-b-4 border-primary pb-8">
          <div className="space-y-4">
            <AppLogo className="items-start" />
            <div className="space-y-1">
              <p className="text-xl font-black text-primary">QTBM Digital Wallet</p>
              <p className="text-xs font-bold text-muted-foreground">التميز المالي الرقمي والأمان المتكامل</p>
            </div>
          </div>
          <div className="text-left space-y-2">
            <h2 className="text-2xl font-black uppercase tracking-widest text-primary">Account Statement</h2>
            <div className="text-[10px] font-bold text-muted-foreground uppercase space-y-1">
              <p>ID: {user?.uid.slice(0, 16)}...</p>
              <p>Date Generated: {format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
              <p>Period: {dateFrom} To {dateTo}</p>
            </div>
          </div>
        </div>

        {/* User Info Section */}
        <div className="grid grid-cols-2 gap-8 bg-slate-50 p-6 rounded-3xl border border-slate-100">
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-primary">
                <User className="h-4 w-4" />
                <span className="text-xs font-black uppercase">معلومات صاحب الحساب</span>
             </div>
             <div className="space-y-1">
                <p className="text-lg font-black">{profile?.fullName}</p>
                <p className="text-xs font-bold text-muted-foreground">{profile?.email}</p>
             </div>
          </div>
          <div className="space-y-3">
             <div className="flex items-center gap-2 text-primary">
                <Phone className="h-4 w-4" />
                <span className="text-xs font-black uppercase">تفاصيل التواصل</span>
             </div>
             <div className="space-y-1">
                <p className="text-sm font-black">{profile?.phoneNumber}</p>
                <p className="text-xs font-bold text-muted-foreground">{profile?.city} - {profile?.address}</p>
             </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="space-y-4">
           <h3 className="text-lg font-black flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              سجل الحركات المالية
           </h3>
           <div className="border rounded-2xl overflow-hidden">
             <table className="w-full text-right">
                <thead className="bg-primary text-white text-[10px] font-black uppercase">
                   <tr>
                      <th className="px-4 py-4">التاريخ</th>
                      <th className="px-4 py-4">نوع العملية</th>
                      <th className="px-4 py-4">الوصف</th>
                      <th className="px-4 py-4">المبلغ</th>
                      <th className="px-4 py-4">العملة</th>
                      <th className="px-4 py-4">الحالة</th>
                   </tr>
                </thead>
                <tbody className="divide-y text-xs font-bold">
                   {transactions?.map((tx) => (
                     <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                           {tx.createdAt?.seconds ? format(new Date(tx.createdAt.seconds * 1000), 'yyyy-MM-dd') : '-'}
                        </td>
                        <td className="px-4 py-4 uppercase">{tx.type}</td>
                        <td className="px-4 py-4 max-w-[200px] truncate">{tx.description}</td>
                        <td className={`px-4 py-4 font-black ${tx.type === 'send' || tx.type === 'withdraw' || tx.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}>
                           {tx.type === 'send' || tx.type === 'withdraw' || tx.type === 'purchase' ? '-' : '+'}
                           {tx.amount?.toLocaleString()}
                        </td>
                        <td className="px-4 py-4 font-black">{tx.currency}</td>
                        <td className="px-4 py-4">
                           <Badge variant="outline" className="text-[8px] font-black border-slate-200">
                              {tx.status}
                           </Badge>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
           </div>
        </div>

        {/* Summary / Footer Section */}
        <div className="mt-20 border-t pt-8 grid grid-cols-2 gap-10">
           <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                 <p className="text-[10px] font-black text-muted-foreground mb-2">إقرار قانوني</p>
                 <p className="text-[8px] font-bold leading-relaxed text-muted-foreground">
                    هذا المستند صادر إلكترونياً من محفظة QTBM الرقمية. تم تدقيق كافة المعاملات المذكورة أعلاه برمجياً. في حال وجود أي استفسار، يرجى التواصل مع الدعم الفني عبر التطبيق الرسمي.
                 </p>
              </div>
           </div>
           <div className="flex flex-col items-end gap-6">
              <div className="text-center space-y-4">
                 <div className="h-24 w-24 border-2 border-primary rounded-full flex items-center justify-center opacity-20 rotate-12">
                    <span className="text-[10px] font-black text-primary">QTBM VERIFIED</span>
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Digital Signature</p>
              </div>
           </div>
        </div>

        {/* Footer Contact */}
        <div className="flex justify-center gap-6 pt-10 text-[9px] font-bold text-muted-foreground border-t border-slate-100">
           <div className="flex items-center gap-1"><Globe className="h-3 w-3" /> www.qtbm.com</div>
           <div className="flex items-center gap-1"><Wallet className="h-3 w-3" /> QTBM Secure Wallet System</div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          .mesh-background { background: white !important; }
          header, .print-hide { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
