
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Search, Info, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SendMoneyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    recipientUid: '',
  });

  const walletRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  useEffect(() => {
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const recipientUid = searchParams.get('recipientUid');

    if (amount) setFormData(prev => ({ ...prev, amount }));
    if (currency) setFormData(prev => ({ ...prev, currency }));
    if (recipientUid) setFormData(prev => ({ ...prev, recipientUid }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !wallet) return;

    const amount = parseFloat(formData.amount);
    const currencyKey = `${formData.currency.toLowerCase()}Balance` as keyof typeof wallet;
    const currentBalance = (wallet[currencyKey] as number) || 0;
    
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "مبلغ غير صالح", variant: "destructive" });
      return;
    }

    if (currentBalance < amount) {
      toast({ 
        title: "رصيد غير كافٍ في هذه العملة", 
        description: `رصيدك الحالي في ${formData.currency} هو ${currentBalance}. يرجى اختيار عملة أخرى أو شحن الرصيد.`, 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      // Create a system task for admin to process
      await addDoc(collection(db, 'system_tasks'), {
        type: 'transfer',
        senderUid: user.uid,
        receiverUid: formData.recipientUid,
        amount: amount,
        currency: formData.currency,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Record in user's history
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'send',
        amount: amount,
        currency: formData.currency,
        description: `حوالة إلى ${formData.recipientUid}`,
        status: 'Pending',
        createdAt: serverTimestamp(),
      });

      toast({ title: "تم إرسال الطلب", description: "طلب التحويل معلق الآن للمراجعة الأمنية. سيتم خصم المبلغ فور الموافقة." });
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
        <h1 className="text-xl font-black">إرسال رصيد</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-6 w-6 rotate-180" />
        </Button>
      </header>

      <main className="p-6 space-y-6 flex-1 overflow-y-auto">
        <Card className="rounded-[2.5rem] border-none shadow-xl glass-morphism overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
               <ShieldCheck className="h-5 w-5 text-primary" />
               تفاصيل الحوالة
            </CardTitle>
            <CardDescription className="font-bold">يرجى ملاحظة أن كل عملة مستقلة تماماً.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label className="font-bold">معرف المستلم (UID)</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="أدخل الـ UID للمستلم" 
                    className="pr-10 h-12 rounded-2xl"
                    value={formData.recipientUid}
                    onChange={(e) => setFormData({...formData, recipientUid: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label className="font-bold">المبلغ</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-12 rounded-2xl"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="font-bold">العملة</Label>
                  <Select value={formData.currency} onValueChange={(val) => setFormData({...formData, currency: val})}>
                    <SelectTrigger className="h-12 rounded-2xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD (دولار)</SelectItem>
                      <SelectItem value="YER">YER (يمني)</SelectItem>
                      <SelectItem value="SAR">SAR (سعودي)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl flex gap-3 border border-primary/10">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                  سيتم خصم المبلغ من رصيد عملة <span className="text-primary">{formData.currency}</span> فقط. تأكد من أن المستلم يستخدم نفس العملة لتجنب التأخير.
                </p>
              </div>

              <Button type="submit" className="w-full h-16 rounded-[2rem] font-black text-lg gap-2 shadow-2xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : <Send className="h-5 w-5" />}
                {isLoading ? "جاري الإرسال..." : "إرسال الحوالة"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
