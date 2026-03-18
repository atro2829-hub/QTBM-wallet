
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, TrendingUp, ShieldCheck, Clock, CheckCircle2, Loader2, Sparkles, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, serverTimestamp, addDoc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateDocumentNonBlocking } from '@/firebase';

export default function InvestPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const plansQuery = useMemoFirebase(() => collection(db, 'investment_plans'), [db]);
  const { data: plans, isLoading: plansLoading } = useCollection(plansQuery);

  const walletRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  const configRef = useMemoFirebase(() => doc(db, 'system', 'config'), [db]);
  const { data: config } = useDoc(configRef);

  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [investAmount, setInvestAmount] = useState('');
  const [investCurrency, setInvestCurrency] = useState('USD');
  const [isProcessing, setIsProcessing] = useState(false);

  const YER_RATE = config?.usdToYerRate || 1500;
  const SAR_RATE = config?.usdToSarRate || 3.75;

  const handleStartInvest = async () => {
    if (!user || !wallet || !selectedPlan || !investAmount) return;
    const amount = parseFloat(investAmount);
    
    // Check if amount >= minAmount (converted to selected currency)
    let minInCurrency = selectedPlan.minAmount || 20;
    if (investCurrency === 'YER') minInCurrency *= YER_RATE;
    if (investCurrency === 'SAR') minInCurrency *= SAR_RATE;

    if (amount < minInCurrency) {
      toast({ title: "المبلغ أقل من الحد الأدنى", variant: "destructive" });
      return;
    }

    const balanceKey = `${investCurrency.toLowerCase()}Balance` as keyof typeof wallet;
    const currentBalance = (wallet[balanceKey] as number) || 0;

    if (currentBalance < amount) {
      toast({ title: "رصيد غير كافٍ", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + (selectedPlan.durationDays || 30));

      const expectedProfit = amount * ((selectedPlan.interestRate || 8) / 100);

      // 1. Deduct balance
      const userWalletRef = doc(db, 'users', user.uid, 'wallet', 'wallet');
      updateDocumentNonBlocking(userWalletRef, {
        [balanceKey]: increment(-amount),
        updatedAt: serverTimestamp()
      });

      // 2. Create investment record
      await addDoc(collection(db, 'users', user.uid, 'investments'), {
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: amount,
        currency: investCurrency,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        interestRate: selectedPlan.interestRate || 8,
        expectedReturn: amount + expectedProfit,
        status: 'active',
        createdAt: serverTimestamp(),
      });

      // 3. Record transaction
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'withdraw',
        amount: amount,
        currency: investCurrency,
        description: `بدء استثمار: ${selectedPlan.name}`,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      toast({ title: "تم بدء الاستثمار", description: "بالتوفيق في رحلتك المالية!" });
      router.push('/dashboard/invest/active');
    } catch (e: any) {
      toast({ title: "فشل الاستثمار", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  const getMinLabel = (plan: any) => {
    if (!plan) return '0.00';
    const minAmount = plan.minAmount || 20;
    if (investCurrency === 'USD') return `${minAmount} USD`;
    if (investCurrency === 'YER') return `${(minAmount * YER_RATE).toLocaleString()} YER`;
    if (investCurrency === 'SAR') return `${(minAmount * SAR_RATE).toLocaleString()} SAR`;
    return `${minAmount} USD`;
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">مركز الاستثمار</h1>
        <div className="flex gap-2">
           <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px]" onClick={() => router.push('/dashboard/invest/active')}>استثماراتي</Button>
           <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
             <ArrowRight className="h-6 w-6" />
           </Button>
        </div>
      </header>

      <main className="p-6 space-y-6 flex-1 overflow-y-auto pb-20">
        <div className="space-y-2">
           <h2 className="text-2xl font-black tracking-tight flex items-center gap-2">خطط استثمارية مختارة <Sparkles className="h-5 w-5 text-yellow-500" /></h2>
           <p className="text-xs text-muted-foreground font-bold">استثمر بذكاء واحصد عوائد شهرية ثابتة ومضمونة.</p>
        </div>

        {plansLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>
        ) : (
          <div className="space-y-4">
            {plans?.filter(p => p.isActive !== false).map((plan) => (
              <Card key={plan.id} className="rounded-[2.5rem] border-none shadow-xl glass-morphism overflow-hidden group hover:scale-[1.02] transition-all">
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white relative">
                   <TrendingUp className="absolute right-4 bottom-4 h-20 w-20 opacity-10" />
                   <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-2 font-black uppercase tracking-widest text-[8px]">{plan.interestRate || 8}% عائد</Badge>
                   <h3 className="text-xl font-black">{plan.name}</h3>
                   <p className="text-xs text-white/70 mt-1">{plan.description}</p>
                </div>
                <CardContent className="p-6 space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                         <p className="text-[10px] font-black uppercase text-muted-foreground">الحد الأدنى</p>
                         <p className="text-sm font-black">{plan.minAmount || 20} USD وما يقابلها</p>
                      </div>
                      <div className="space-y-1 text-left">
                         <p className="text-[10px] font-black uppercase text-muted-foreground">المدة</p>
                         <p className="text-sm font-black">{plan.durationDays || 30} يوم</p>
                      </div>
                   </div>
                   <Button className="w-full h-12 rounded-2xl font-black bg-emerald-600 hover:bg-emerald-700" onClick={() => setSelectedPlan(plan)}>اشتراك الآن</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
          <DialogContent className="rounded-[2.5rem] max-w-sm border-none shadow-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-right font-black">بدء الاستثمار في {selectedPlan?.name}</DialogTitle>
              <DialogDescription className="text-right font-bold text-xs">أدخل المبلغ والعملة المراد الاستثمار بها.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2 text-right">
                    <Label className="text-[10px] font-black opacity-60">العملة</Label>
                    <Select value={investCurrency} onValueChange={setInvestCurrency}>
                       <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold"><SelectValue /></SelectTrigger>
                       <SelectContent>
                         <SelectItem value="USD">USD</SelectItem>
                         <SelectItem value="YER">YER</SelectItem>
                         <SelectItem value="SAR">SAR</SelectItem>
                       </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-[10px] font-black opacity-60">المبلغ</Label>
                    <Input type="number" placeholder="0.00" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)} className="h-12 rounded-xl bg-muted/30 border-none font-black" />
                  </div>
               </div>
               <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 space-y-1">
                  <p className="text-[10px] font-bold text-emerald-700">الحد الأدنى لهذه الخطة: {getMinLabel(selectedPlan)}</p>
                  <p className="text-[10px] font-bold text-muted-foreground">سيتم تجميد هذا المبلغ لمدة {selectedPlan?.durationDays || 30} يوم.</p>
               </div>
            </div>
            <DialogFooter>
               <Button onClick={handleStartInvest} disabled={isProcessing || !investAmount} className="w-full h-14 rounded-2xl font-black gap-2">
                 {isProcessing ? <Loader2 className="animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                 تأكيد البدء بالاستثمار
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
