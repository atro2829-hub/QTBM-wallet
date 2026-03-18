
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Gem, ShieldCheck, TrendingUp, Info, Loader2, CheckCircle2, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, serverTimestamp, increment, collection, addDoc } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function GoldVaultPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [amountGrams, setAmountGrams] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const GOLD_PRICE_PER_GRAM = 75; // سعر افتراضي 75 دولار للجرام
  const MONTHLY_INTEREST = 0.05; // فائدة 5% شهرياً على مخزون الذهب

  const walletRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  const handleBuyGold = async () => {
    if (!user || !wallet || !amountGrams) return;
    const grams = parseFloat(amountGrams);
    const totalCost = grams * GOLD_PRICE_PER_GRAM;

    if (wallet.usdBalance < totalCost) {
      toast({ title: "رصيد دولار غير كافٍ", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      updateDocumentNonBlocking(walletRef!, {
        usdBalance: increment(-totalCost),
        goldBalance: increment(grams),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'purchase',
        amount: totalCost,
        currency: 'USD',
        description: `شراء ${grams} جرام ذهب وتخزينه في الخزنة`,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      toast({ title: "تم التخزين بنجاح", description: "ذهبك الآن في أمان وسيبدأ في توليد الفوائد." });
      setAmountGrams('');
    } catch (e: any) {
      toast({ title: "خطأ", description: e.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">خزنة الذهب الملكية</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="p-6 space-y-6 flex-1 overflow-y-auto pb-20">
        <div className="relative group overflow-hidden rounded-[2.5rem]">
           <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-700 animate-pulse opacity-20" />
           <Card className="border-none bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 text-white p-8 space-y-6 shadow-2xl relative z-10">
              <div className="flex justify-between items-start">
                 <div className="p-4 bg-white/20 rounded-[1.5rem] backdrop-blur-md">
                    <Gem className="h-8 w-8 text-white" />
                 </div>
                 <Badge className="bg-white/20 text-white border-none font-black">+5% فوائد شهرية</Badge>
              </div>
              <div className="space-y-1">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">مخزونك الحالي من الذهب</p>
                 <h2 className="text-5xl font-black tracking-tighter">{(wallet?.goldBalance || 0).toLocaleString()} <span className="text-xl font-bold">جرام</span></h2>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[10px] font-bold text-white/60">
                 <ShieldCheck className="h-4 w-4" />
                 <span>مؤمن بالكامل عبر نظام QTBM Secure Vault</span>
              </div>
           </Card>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl glass-morphism overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-yellow-600" />
               شراء وتخزين الذهب
            </CardTitle>
            <CardDescription className="font-bold">سعر الجرام اليوم: {GOLD_PRICE_PER_GRAM}$</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-2 text-right">
              <Label className="font-bold text-xs uppercase opacity-60">الكمية المطلوبة (بالجرام)</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="h-16 rounded-2xl text-2xl font-black"
                value={amountGrams}
                onChange={(e) => setAmountGrams(e.target.value)}
              />
            </div>

            <div className="p-5 bg-yellow-500/5 rounded-[2rem] border border-yellow-500/10 space-y-3">
               <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-muted-foreground">التكلفة بالدولار:</span>
                  <span className="text-yellow-700 font-black text-xl">{(parseFloat(amountGrams || '0') * GOLD_PRICE_PER_GRAM).toLocaleString()}$</span>
               </div>
               <div className="flex justify-between items-center text-[10px] font-bold text-emerald-600 border-t border-yellow-500/10 pt-2">
                  <span>الزيادة الشهرية المتوقعة:</span>
                  <span>+{(parseFloat(amountGrams || '0') * MONTHLY_INTEREST).toFixed(2)} جرام</span>
               </div>
            </div>

            <Button 
              className="w-full h-16 rounded-[2rem] font-black text-lg gap-2 shadow-xl bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20 active:scale-95 transition-all" 
              onClick={handleBuyGold}
              disabled={isLoading || !amountGrams}
            >
              {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <Coins className="h-6 w-6" />}
              تأكيد التخزين الآن
            </Button>
          </CardContent>
        </Card>

        <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] flex gap-4 items-start">
           <Info className="h-6 w-6 text-blue-600 shrink-0" />
           <div className="space-y-1">
              <p className="font-black text-sm text-blue-700">كيف تعمل الفوائد؟</p>
              <p className="text-[10px] font-medium text-blue-600/80 leading-relaxed">
                 عند تخزين الذهب، يتم احتساب فائدة شهرية قدرها 5% تضاف إلى رصيد الجرامات الخاص بك. يتم الصرف في اليوم الأول من كل شهر ميلادي تلقائياً.
              </p>
           </div>
        </div>
      </main>
    </div>
  );
}
