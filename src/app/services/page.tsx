
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Search, Music, Tv, Gamepad2, ShoppingCart, Coins, Info, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BottomNav } from '@/components/layout/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ServicesPage() {
  const router = useRouter();
  const { user } = user; // This should be useUser()
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [usdtAmount, setUsdtAmount] = useState('');
  const [purchaseCurrency, setPurchaseCurrency] = useState('USD');
  
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products } = useCollection(productsQuery);

  const walletRef = useMemoFirebase(() => currentUser ? doc(db, 'users', currentUser.uid, 'wallet', 'wallet') : null, [db, currentUser]);
  const { data: wallet } = useDoc(walletRef);

  const COMMISSION_RATE = 0.05;
  const usdtTotal = usdtAmount ? (parseFloat(usdtAmount) * (1 + COMMISSION_RATE)).toFixed(2) : '0.00';

  const handleBuyUsdt = async () => {
    if (!currentUser || !wallet) return;
    const amount = parseFloat(usdtAmount);
    const totalWithCommission = parseFloat(usdtTotal);

    const balanceKey = `${purchaseCurrency.toLowerCase()}Balance` as keyof typeof wallet;
    const currentBalance = (wallet[balanceKey] as number) || 0;

    if (isNaN(amount) || amount <= 0) {
      toast({ title: "مبلغ غير صالح", variant: "destructive" });
      return;
    }

    if (currentBalance < totalWithCommission) {
      toast({ title: "رصيد غير كافٍ", description: `تحتاج إلى ${totalWithCommission} ${purchaseCurrency} لإتمام هذه العملية.`, variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
        initiatorUserId: currentUser.uid,
        type: 'purchase',
        amount: totalWithCommission,
        currency: purchaseCurrency,
        description: `شراء ${amount} USDT (شامل عمولة 5%)`,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      toast({ title: "تمت عملية الشراء بنجاح", description: `لقد اشتريت ${amount} USDT.` });
      setUsdtAmount('');
    } catch (error: any) {
      toast({ title: "فشلت العملية", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'Music': return <Music className="h-6 w-6 text-pink-500" />;
      case 'Tv': return <Tv className="h-6 w-6 text-red-500" />;
      case 'Gamepad2': return <Gamepad2 className="h-6 w-6 text-blue-500" />;
      case 'Coins': return <Coins className="h-6 w-6 text-yellow-500" />;
      default: return <ShoppingCart className="h-6 w-6 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x pb-24 shadow-2xl overflow-hidden">
      <header className="p-6 pb-2 flex flex-col gap-4 sticky top-0 bg-background/50 backdrop-blur-md z-20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">الترفيه والخدمات</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
        <div className="relative group">
          <Search className="absolute right-4 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث عن ألعاب، عملات، خدمات..." className="pr-12 h-12 bg-card/50 glass-morphism border-none rounded-2xl text-right" />
        </div>
      </header>

      <main className="p-6 space-y-8 flex-1 overflow-y-auto">
        <Tabs defaultValue="crypto" dir="rtl" className="w-full">
          <TabsList className="w-full h-14 glass-morphism p-1 rounded-2xl bg-card/30 flex gap-1">
            <TabsTrigger value="crypto" className="flex-1 rounded-xl font-bold h-full">العملات الرقمية</TabsTrigger>
            <TabsTrigger value="digital" className="flex-1 rounded-xl font-bold h-full">خدمات ديجيتال</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="mt-6 space-y-6">
            <Card className="glass-morphism border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent overflow-hidden rounded-[2.5rem] shadow-xl">
              <CardHeader className="relative text-right">
                <div className="absolute -left-8 -top-8 h-32 w-32 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
                <CardTitle className="flex items-center gap-2 justify-end">
                  شراء USDT
                  <div className="p-2 bg-yellow-500/20 rounded-xl">
                    <Coins className="h-5 w-5 text-yellow-600" />
                  </div>
                </CardTitle>
                <CardDescription className="font-bold">تحويل فوري بعمولة 5% فقط</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">المبلغ المطلوب (USDT)</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="0.00" 
                      className="h-16 bg-white/5 border-white/20 rounded-2xl text-2xl font-black pr-5 text-right"
                      value={usdtAmount}
                      onChange={(e) => setUsdtAmount(e.target.value)}
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground bg-accent px-4 py-1.5 rounded-xl">USDT</div>
                  </div>
                </div>

                <div className="space-y-2 text-right">
                   <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70">العملة المستخدمة للدفع</Label>
                   <Select value={purchaseCurrency} onValueChange={setPurchaseCurrency}>
                      <SelectTrigger className="h-12 rounded-2xl text-right glass-morphism">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">الدولار الأمريكي (USD)</SelectItem>
                        <SelectItem value="YER">الريال اليمني (YER)</SelectItem>
                        <SelectItem value="SAR">الريال السعودي (SAR)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>

                <div className="p-5 bg-primary/5 rounded-[2rem] space-y-4 border border-primary/10 backdrop-blur-sm">
                  <div className="flex justify-between text-sm font-bold">
                    <span>السعر الأصلي</span>
                    <span>{usdtAmount || '0'} {purchaseCurrency}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-primary">
                    <span>العمولة (5%)</span>
                    <span>+{(parseFloat(usdtTotal) - (parseFloat(usdtAmount) || 0)).toFixed(2)} {purchaseCurrency}</span>
                  </div>
                  <div className="border-t border-dashed border-primary/20 pt-4 flex justify-between items-center">
                    <span className="text-lg font-black tracking-tight">التكلفة الإجمالية</span>
                    <span className="text-xl font-black text-primary tracking-tighter">{usdtTotal} {purchaseCurrency}</span>
                  </div>
                </div>

                <Button className="w-full h-16 rounded-[2rem] font-black text-lg shadow-2xl shadow-primary/20 transition-all active:scale-95" disabled={isProcessing} onClick={handleBuyUsdt}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : "إتمام عملية الشراء الآن"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-morphism p-6 rounded-[2.5rem] space-y-3 text-center active:scale-95 transition-transform cursor-pointer group">
                <div className="h-14 w-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-blue-500/20 transition-colors shadow-lg">
                  <Gamepad2 className="h-8 w-8 text-blue-500" />
                </div>
                <p className="font-black text-xs tracking-tight">بطاقات الألعاب</p>
              </div>
              <div className="glass-morphism p-6 rounded-[2.5rem] space-y-3 text-center active:scale-95 transition-transform cursor-pointer group">
                <div className="h-14 w-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-purple-500/20 transition-colors shadow-lg">
                  <Sparkles className="h-8 w-8 text-purple-500" />
                </div>
                <p className="font-black text-xs tracking-tight">اشتراكات مميزة</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="digital" className="mt-6 space-y-6">
             <div className="grid grid-cols-1 gap-4">
               {products?.map((product) => (
                 <Card key={product.id} className="glass-morphism rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all active:scale-[0.98] group overflow-hidden">
                   <CardContent className="p-5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="p-4 bg-accent/50 rounded-[1.5rem] group-hover:bg-primary/10 transition-colors shadow-inner">
                         {getIcon(product.iconName || 'ShoppingCart')}
                       </div>
                       <div className="text-right">
                         <h3 className="font-black text-sm tracking-tight">{product.name}</h3>
                         <p className="text-primary font-black text-sm tracking-tighter mt-1">
                           {product.price} {product.currency}
                         </p>
                       </div>
                     </div>
                     <Button size="lg" className="rounded-2xl px-8 font-black shadow-lg shadow-primary/10" onClick={() => {
                        toast({ title: "جاري المعالجة...", description: `بدء عملية الشراء لـ ${product.name}` });
                     }}>
                       شراء
                     </Button>
                   </CardContent>
                 </Card>
               ))}
               {(!products || products.length === 0) && (
                 <div className="py-20 text-center space-y-4 opacity-50">
                    <TrendingUp className="h-16 w-16 mx-auto text-primary/30 animate-bounce" />
                    <p className="text-sm font-black text-muted-foreground">قريباً.. سنضيف المزيد من المنتجات</p>
                 </div>
               )}
             </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
}
