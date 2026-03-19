"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, RefreshCw, Info, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp, increment, collection } from 'firebase/firestore';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';

export default function ExchangePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('YER');
  const [toCurrency, setToCurrency] = useState('USD');
  const [amount, setAmount] = useState('');

  const walletRef = useMemoFirebase(() => (user && db) ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  const configRef = useMemoFirebase(() => db ? doc(db, 'system', 'config') : null, [db]);
  const { data: config } = useDoc(configRef);

  const YER_RATE = config?.usdToYerRate || 1500;
  const SAR_RATE = config?.usdToSarRate || 3.75;

  const calculateExchange = () => {
    const val = parseFloat(amount);
    if (isNaN(val)) return 0;

    let inUsd = 0;
    if (fromCurrency === 'USD') inUsd = val;
    else if (fromCurrency === 'YER') inUsd = val / YER_RATE;
    else if (fromCurrency === 'SAR') inUsd = val / SAR_RATE;

    if (toCurrency === 'USD') return inUsd;
    if (toCurrency === 'YER') return inUsd * YER_RATE;
    if (toCurrency === 'SAR') return inUsd * SAR_RATE;
    return 0;
  };

  const handleExchange = async () => {
    if (!user || !wallet || !amount || !db || !walletRef) return;
    const fromAmount = parseFloat(amount);
    const toAmount = calculateExchange();

    const fromKey = `${fromCurrency.toLowerCase()}Balance` as keyof typeof wallet;
    const currentBalance = (wallet[fromKey] as number) || 0;

    if (currentBalance < fromAmount) {
      toast({ title: "رصيد غير كافٍ", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const fromField = `${fromCurrency.toLowerCase()}Balance`;
      const toField = `${toCurrency.toLowerCase()}Balance`;

      updateDocumentNonBlocking(walletRef, {
        [fromField]: increment(-fromAmount),
        [toField]: increment(toAmount),
        updatedAt: serverTimestamp()
      });

      addDocumentNonBlocking(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'purchase',
        amount: fromAmount,
        currency: fromCurrency,
        description: `تبادل عملات: تحويل ${fromAmount} ${fromCurrency} إلى ${toAmount.toFixed(2)} ${toCurrency}`,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      toast({ title: "تم التبادل بنجاح", description: "تم تحديث أرصدتك فوراً." });
      router.push('/dashboard');
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">تبادل العملات</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="p-6 space-y-6 flex-1 overflow-y-auto">
        <Card className="rounded-[2.5rem] border-none shadow-xl glass-morphism overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
               <RefreshCw className="h-5 w-5 text-primary" />
               تحويل فوري بين المحافظ
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 text-right">
                <Label className="font-bold text-xs uppercase opacity-60">من عملة</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="h-14 rounded-2xl bg-background/50 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="YER">YER</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-right">
                <Label className="font-bold text-xs uppercase opacity-60">إلى عملة</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="h-14 rounded-2xl bg-background/50 font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="YER">YER</SelectItem>
                    <SelectItem value="SAR">SAR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 text-right">
              <Label className="font-bold text-xs uppercase opacity-60">المبلغ المراد تحويله</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-16 rounded-2xl text-2xl font-black"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 flex flex-col gap-2">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground">ستستلم تقريباً:</span>
                  <span className="text-primary font-black text-xl">{calculateExchange().toFixed(2)} {toCurrency}</span>
               </div>
               <p className="text-[10px] text-center text-muted-foreground">يتم التحويل بناءً على أسعار الصرف الحالية للنظام.</p>
            </div>

            <Button 
              className="w-full h-16 rounded-[2rem] font-black text-lg gap-2 shadow-xl shadow-primary/20 transition-all active:scale-95" 
              onClick={handleExchange}
              disabled={isLoading || !amount || fromCurrency === toCurrency}
            >
              {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
              تأكيد التبادل الآن
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}