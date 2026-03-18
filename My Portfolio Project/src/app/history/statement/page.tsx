"use client";

import React, { useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowRight, 
  Printer, 
  Download, 
  Wallet, 
  Clock, 
  User, 
  Phone, 
  Globe, 
  CheckCircle2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
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
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-12 w-12 text-primary" />
        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">جاري إنشاء التقرير المالي...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-primary/10" dir="rtl">
      {/* Tool Bar - Hidden in Print */}
      <div className="print:hidden p-4 flex items-center justify-between border-b bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="flex gap-4 items-center">
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
              <ArrowRight className="h-6 w-6" />
           </Button>
           <div className="flex flex-col">
             <h1 className="text-sm font-black">كشف الحساب الرقمي</h1>
             <p className="text-[10px] text-muted-foreground font-bold">للفترة: {dateFrom} - {dateTo}</p>
           </div>
        </div>
        <div className="flex gap-2">
           <Button size="sm" onClick={handlePrint} className="rounded-xl gap-2 font-black shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
              <Printer className="h-4 w-4" />
              طباعة / حفظ PDF
           </Button>
        </div>
      </div>

      {/* Statement Content */}
      <main ref={printRef} className="max-w-4xl mx-auto p-8 md:p-12 space-y-10 print:p-0 bg-white shadow-2xl my-10 print:my-0 print:shadow-none min-h-[1123px]">
        
        {/* Official Header Section */}
        <div className="flex justify-between items-start border-b-4 border-primary pb-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
               <AppLogo iconOnly className="h-16 w-16" />
               <div className="space-y-1">
                 <p className="text-2xl font-black text-primary tracking-tighter">QTBM Wallet</p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">The Digital Excellence in Finance</p>
               </div>
            </div>
            <div className="bg-slate-900 text-white px-6 py-2 rounded-full inline-block">
               <span className="text-xs font-black uppercase tracking-[0.2em]">Official Account Statement</span>
            </div>
          </div>
          
          <div className="text-left space-y-2">
            <h2 className="text-3xl font-black uppercase text-slate-800">كشف حساب</h2>
            <div className="text-[10px] font-mono font-bold text-muted-foreground uppercase space-y-1">
              <p>رقم الحساب (UID): {user?.uid}</p>
              <p>تاريخ الاستخراج: {format(new Date(), 'yyyy-MM-dd HH:mm')}</p>
              <p>تاريخ البداية: {dateFrom}</p>
              <p>تاريخ النهاية: {dateTo}</p>
            </div>
          </div>
        </div>

        {/* User & Wallet Summary Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-slate-50 p-6 rounded-3xl border border-slate-100 flex gap-6">
            <div className="space-y-4 flex-1">
               <div className="flex items-center gap-2 text-primary border-b border-primary/10 pb-2">
                  <User className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase">معلومات صاحب الحساب</span>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">الاسم الكامل</p>
                   <p className="text-sm font-black">{profile?.fullName}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">رقم الهاتف</p>
                   <p className="text-sm font-black">{profile?.phoneNumber}</p>
                 </div>
                 <div className="col-span-2">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase">العنوان المسجل</p>
                   <p className="text-sm font-black">{profile?.city} - {profile?.address}</p>
                 </div>
               </div>
            </div>
          </div>

          <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
             <div className="flex items-center gap-2 text-primary border-b border-primary/20 pb-2">
                <Wallet className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase">الحالة الأمنية</span>
             </div>
             <div className="flex flex-col items-center justify-center pt-2 gap-2">
                <CheckCircle2 className="h-10 w-10 text-primary" />
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Account Verified</p>
                <Badge variant="outline" className="text-[8px] font-black border-primary/20 text-primary">QTBM SECURE</Badge>
             </div>
          </div>
        </div>

        {/* Transactions Detailed Table */}
        <div className="space-y-4">
           <h3 className="text-lg font-black flex items-center gap-2 px-2">
              <Clock className="h-5 w-5 text-primary" />
              سجل الحركات المالية التفصيلي
           </h3>
           <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
             <table className="w-full text-right">
                <thead className="bg-slate-900 text-white text-[10px] font-black uppercase">
                   <tr>
                      <th className="px-6 py-5">التاريخ</th>
                      <th className="px-6 py-5">نوع العملية</th>
                      <th className="px-6 py-5">الوصف</th>
                      <th className="px-6 py-5">المبلغ</th>
                      <th className="px-6 py-5">العملة</th>
                      <th className="px-6 py-5">الحالة</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px] font-bold">
                   {transactions?.map((tx) => (
                     <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                           {tx.createdAt?.seconds ? format(new Date(tx.createdAt.seconds * 1000), 'yyyy-MM-dd') : '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="uppercase text-slate-400">{tx.type}</span>
                        </td>
                        <td className="px-6 py-4 max-w-[250px]">
                           <div className="flex flex-col">
                             <span className="font-black text-slate-800">{tx.description}</span>
                             {tx.recipientName && <span className="text-[9px] text-primary">إلى: {tx.recipientName}</span>}
                             {tx.senderName && <span className="text-[9px] text-green-600">من: {tx.senderName}</span>}
                           </div>
                        </td>
                        <td className={`px-6 py-4 text-sm font-black ${tx.type === 'send' || tx.type === 'withdraw' || tx.type === 'purchase' ? 'text-red-600' : 'text-green-600'}`}>
                           {tx.type === 'send' || tx.type === 'withdraw' || tx.type === 'purchase' ? '-' : '+'}
                           {tx.amount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 font-black text-slate-800">{tx.currency}</td>
                        <td className="px-6 py-4">
                           <div className={`inline-flex px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                             tx.status?.toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                           }`}>
                              {tx.status}
                           </div>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
             {(!transactions || transactions.length === 0) && (
               <div className="p-20 text-center space-y-4 opacity-20">
                  <FileText className="h-16 w-16 mx-auto" />
                  <p className="font-black">لا توجد حركات مالية في هذه الفترة</p>
               </div>
             )}
           </div>
        </div>

        {/* Signature & Validation Section */}
        <div className="mt-auto pt-20 grid grid-cols-2 gap-12 items-end">
           <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-3">
                 <p className="text-[10px] font-black text-slate-800 uppercase border-b border-slate-200 pb-2">إقرار قانوني وصحة بيانات</p>
                 <p className="text-[9px] font-bold leading-relaxed text-slate-500">
                    هذا الكشف صادر برمجياً من الأنظمة المحاسبية لمحفظة QTBM الرقمية. كافة المعاملات المذكورة خضعت للتدقيق التقني والأمني. يعتبر هذا المستند مرجعاً رسمياً لصاحب الحساب لتوثيق حركاته المالية خلال الفترة المذكورة.
                 </p>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground text-[10px] font-bold">
                 <div className="flex items-center gap-1"><Globe className="h-3 w-3" /> www.qtbm.com</div>
                 <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> support@qtbm.com</div>
              </div>
           </div>
           
           <div className="flex flex-col items-center gap-4">
              <div className="relative h-32 w-32 flex items-center justify-center">
                 <div className="absolute inset-0 border-2 border-primary/20 rounded-full border-dashed animate-spin-slow" />
                 <div className="h-24 w-24 border-2 border-primary rounded-full flex items-center justify-center opacity-40 rotate-12">
                    <span className="text-[10px] font-black text-primary text-center leading-tight">QTBM<br/>VERIFIED<br/>SYSTEM</span>
                 </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">التوقيع الرقمي المعتمد</p>
           </div>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background-color: white !important;
            -webkit-print-color-adjust: exact;
          }
          .print-hide {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            width: 100% !important;
            max-width: none !important;
          }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
