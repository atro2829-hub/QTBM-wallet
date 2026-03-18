
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Wallet, Banknote, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, useDoc, useMemoFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';

export default function WithdrawPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    details: '',
  });

  const walletRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !wallet) return;
    
    const amount = parseFloat(formData.amount);
    const balanceKey = `${formData.currency.toLowerCase()}Balance` as keyof typeof wallet;
    const currentBalance = (wallet[balanceKey] as number) || 0;

    if (isNaN(amount) || amount <= 0) {
      toast({ title: "مبلغ غير صالح", variant: "destructive" });
      return;
    }

    if (currentBalance < amount) {
      toast({ title: "رصيد غير كافٍ", description: `رصيدك الحالي هو ${currentBalance} ${formData.currency}`, variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, 'withdrawRequests'), {
        userId: user.uid,
        amount: amount,
        currency: formData.currency,
        details: formData.details,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'withdraw',
        amount: amount,
        currency: formData.currency,
        description: `طلب سحب رصيد (${formData.currency})`,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      toast({ title: "تم تقديم الطلب", description: "سيتم مراجعة طلب السحب من قبل الإدارة قريباً." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">سحب الرصيد</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="p-6 space-y-6 overflow-y-auto pb-20">
        <Card className="rounded-[2.5rem] border-none shadow-xl glass-morphism overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              تفاصيل السحب
            </CardTitle>
            <CardDescription className="font-bold">اختر العملة والمبلغ وطريقة الاستلام.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label className="font-bold">اختر العملة المراد سحبها</Label>
                <Select value={formData.currency} onValueChange={(val) => setFormData({...formData, currency: val})}>
                  <SelectTrigger className="h-12 rounded-2xl glass-morphism"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">دولار (USD)</SelectItem>
                    <SelectItem value="YER">ريال يمني (YER)</SelectItem>
                    <SelectItem value="SAR">ريال سعودي (SAR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 text-right">
                <Label className="font-bold">المبلغ</Label>
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  className="h-14 rounded-2xl bg-white/5 border-white/20 text-lg"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  required 
                />
              </div>

              <div className="space-y-2 text-right">
                <Label className="font-bold">تفاصيل الاستلام (رقم الحساب/المحفظة)</Label>
                <textarea 
                  className="w-full min-h-[100px] rounded-2xl bg-white/5 border border-white/20 p-4 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="أدخل رقم حسابك البنكي أو عنوان محفظتك (USDT TRC20)"
                  value={formData.details}
                  onChange={(e) => setFormData({...formData, details: e.target.value})}
                  required 
                />
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl flex gap-3 items-start border border-primary/10">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                  يتم تنفيذ عمليات السحب يدوياً خلال 24 ساعة عمل بعد التأكد من صحة البيانات.
                </p>
              </div>

              <Button type="submit" className="w-full h-16 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "إرسال طلب السحب"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
