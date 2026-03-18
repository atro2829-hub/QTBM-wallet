
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Wallet, Copy, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const DEPOSIT_INFO = {
  USD: [
    { label: 'TRC20 Wallet', value: 'TF3kH28vsP7we5LKk7VoUjh1jZfyXXWCQr' },
    { label: 'Binance ID', value: '582733976' },
    { label: 'بنك الكريمي (USD)', value: '3104105757' },
    { label: 'بنك القطيبي (USD)', value: '462175547' }
  ],
  YER: [
    { label: 'بنك القطيبي (YER)', value: '462175547' },
    { label: 'بنك الكريمي (YER)', value: '3108878826' }
  ],
  SAR: [
    { label: 'بنك القطيبي (SAR)', value: '462175547' },
    { label: 'بنك الكريمي (SAR)', value: '3111513839' }
  ],
};

function DepositContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    txDetails: '',
  });

  useEffect(() => {
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    if (amount) setFormData(prev => ({ ...prev, amount }));
    if (currency) setFormData(prev => ({ ...prev, currency }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'depositRequests'), {
        userId: user.uid,
        amount: amount,
        currency: formData.currency,
        externalTransactionDetails: formData.txDetails,
        destinationAccountIdentifier: DEPOSIT_INFO[formData.currency as keyof typeof DEPOSIT_INFO][0].value,
        status: 'pending',
        submissionDate: serverTimestamp(),
      });

      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'deposit',
        amount: amount,
        currency: formData.currency,
        description: `Deposit via ${formData.currency}`,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      toast({ title: "Deposit Request Submitted", description: "Our team will verify the transaction soon." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Address copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x pb-20" dir="rtl">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-6 w-6 rotate-180" />
        </Button>
        <h1 className="text-xl font-bold">إيداع رصيد / Deposit</h1>
      </header>

      <main className="p-6 flex-1 overflow-y-auto space-y-6">
        <Card className="shadow-lg border-none bg-primary text-white overflow-hidden relative rounded-[2rem]">
          <CardHeader className="text-right">
            <CardTitle className="text-lg flex items-center gap-2 justify-end">
              تعليمات الإيداع
              <Wallet className="h-5 w-5" />
            </CardTitle>
            <CardDescription className="text-white/70">يرجى تحويل المبلغ لأحد الحسابات التالية:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-right">
              <Label className="text-white/80">العملة المختارة</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(val) => setFormData({...formData, currency: val})}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD (TRC20 / Bank)</SelectItem>
                  <SelectItem value="YER">Yemeni Rial (Bank)</SelectItem>
                  <SelectItem value="SAR">Saudi Rial (Bank)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              {DEPOSIT_INFO[formData.currency as keyof typeof DEPOSIT_INFO]?.map((info, idx) => (
                <div key={idx} className="bg-white/10 rounded-xl p-4 space-y-2 border border-white/20 text-right">
                  <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">{info.label}</p>
                  <div className="flex items-center justify-between gap-2 flex-row-reverse">
                    <code className="text-xs break-all leading-tight font-mono text-left w-full">{info.value}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(info.value)} className="shrink-0 text-white hover:bg-white/20">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none rounded-[2rem] text-right">
          <CardHeader>
            <CardTitle className="text-lg">تفاصيل المعاملة</CardTitle>
            <CardDescription>أدخل المبلغ ورمز الإشعار للتأكيد.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ المحول</Label>
                <Input 
                  id="amount" 
                  type="number" 
                  placeholder="0.00" 
                  className="text-right h-12 rounded-xl"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="txDetails">رقم المعاملة / رقم الإشعار</Label>
                <Input 
                  id="txDetails" 
                  placeholder="الصق رقم العملية هنا" 
                  className="text-right h-12 rounded-xl"
                  value={formData.txDetails}
                  onChange={(e) => setFormData({...formData, txDetails: e.target.value})}
                  required 
                />
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "إرسال طلب التأكيد"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function DepositPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <DepositContent />
    </Suspense>
  );
}
