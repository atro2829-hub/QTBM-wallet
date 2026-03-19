"use client";

import React, { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Coins, Gamepad2, Loader2, Info, ShoppingCart, UserCheck, ShieldCheck } from 'lucide-react';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

function ServicesContent() {
  const router = useRouter();
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [usdtAmount, setUsdtAmount] = useState('');
  const [purchaseCurrency, setPurchaseCurrency] = useState('USD');
  
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [shippingId, setShippingId] = useState('');
  const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
  
  const productsQuery = useMemoFirebase(() => db ? collection(db, 'products') : null, [db]);
  const { data: products } = useCollection(productsQuery);

  const walletRef = useMemoFirebase(() => currentUser && db ? doc(db, 'users', currentUser.uid, 'wallet', 'wallet') : null, [db, currentUser]);
  const { data: wallet } = useDoc(walletRef);

  const configRef = useMemoFirebase(() => db ? doc(db, 'system', 'config') : null, [db]);
  const { data: config } = useDoc(configRef);

  const COMMISSION_RATE = config?.usdtCommission || 0.05;
  const YER_RATE = config?.usdToYerRate || 1500;
  const SAR_RATE = config?.usdToSarRate || 3.75;

  const getUsdtTotal = () => {
    if (!usdtAmount) return '0.00';
    const baseUsd = parseFloat(usdtAmount) * (1 + COMMISSION_RATE);
    
    if (purchaseCurrency === 'YER') return (baseUsd * YER_RATE).toLocaleString();
    if (purchaseCurrency === 'SAR') return (baseUsd * SAR_RATE).toLocaleString();
    return baseUsd.toFixed(2);
  };

  const openPurchaseDialog = (product: any) => {
    if (!currentUser || !wallet) return;
    
    const balanceKey = `${product.currency.toLowerCase()}Balance` as keyof typeof wallet;
    const currentBalance = (wallet[balanceKey] as number) || 0;

    if (currentBalance < product.price) {
      toast({ 
        title: "رصيد غير كافٍ", 
        description: `تحتاج إلى ${product.price} ${product.currency} لإتمام هذه العملية.`, 
        variant: "destructive" 
      });
      return;
    }

    setSelectedProduct(product);
    setShippingId('');
    setIsPurchaseDialogOpen(true);
  };

  const handleFinalizePurchase = async () => {
    if (!currentUser || !wallet || !selectedProduct || !shippingId.trim()) {
      toast({ title: "خطأ", description: "يرجى إدخال معرف الشحن أو البريد الإلكتروني.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await addDoc(collection(db!, 'users', currentUser.uid, 'transactions'), {
        initiatorUserId: currentUser.uid,
        type: 'purchase',
        amount: selectedProduct.price,
        currency: selectedProduct.currency,
        description: `شراء ${selectedProduct.name} (${selectedProduct.category}) - معرف الشحن: ${shippingId}`,
        shippingIdentifier: shippingId,
        productName: selectedProduct.name,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      toast({ title: "تم تنفيذ الطلب", description: `شكراً لشرائك ${selectedProduct.name}. سيتم التنفيذ قريباً.` });
      setIsPurchaseDialogOpen(false);
      setSelectedProduct(null);
    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBuyUsdt = async () => {
    if (!currentUser || !wallet) return;
    const amount = parseFloat(usdtAmount);
    if (isNaN(amount) || amount <= 0) return;

    const baseUsd = amount * (1 + COMMISSION_RATE);
    let totalCost = baseUsd;
    if (purchaseCurrency === 'YER') totalCost = baseUsd * YER_RATE;
    if (purchaseCurrency === 'SAR') totalCost = baseUsd * SAR_RATE;

    const balanceKey = `${purchaseCurrency.toLowerCase()}Balance` as keyof typeof wallet;
    const currentBalance = (wallet[balanceKey] as number) || 0;

    if (currentBalance < totalCost) {
      toast({ title: "رصيد غير كافٍ", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await addDoc(collection(db!, 'users', currentUser.uid, 'transactions'), {
        initiatorUserId: currentUser.uid,
        type: 'purchase',
        amount: totalCost,
        currency: purchaseCurrency,
        description: `شراء ${amount} USDT`,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });
      toast({ title: "تمت عملية الشراء بنجاح" });
      setUsdtAmount('');
    } catch (e: any) {
      toast({ title: "فشل الشراء", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = products ? Array.from(new Set(products.map(p => p.category))) : [];

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x pb-24 shadow-2xl overflow-hidden" dir="rtl">
      <header className="p-6 pb-2 flex flex-col gap-4 sticky top-0 bg-background/50 backdrop-blur-md z-20">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black tracking-tight">الخدمات والمتجر</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
            <ArrowRight className="h-6 w-6" />
          </Button>
        </div>
      </header>

      <main className="p-6 space-y-8 flex-1 overflow-y-auto">
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="w-full h-14 glass-morphism p-1 rounded-2xl bg-card/30 flex gap-1 mb-6">
            <TabsTrigger value="crypto" className="flex-1 rounded-xl font-bold h-full">الكريبتو</TabsTrigger>
            <TabsTrigger value="digital" className="flex-1 rounded-xl font-bold h-full">الخدمات الرقمية</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="space-y-6">
            <Card className="glass-morphism border-primary/20 bg-gradient-to-br from-primary/10 via-transparent to-transparent rounded-[2.5rem] shadow-xl">
              <CardHeader className="text-right">
                <CardTitle className="flex items-center gap-2 justify-end">شراء USDT <Coins className="h-5 w-5 text-yellow-600" /></CardTitle>
                <CardDescription className="font-bold">تحويل فوري إلى محفظتك بعمولة {(COMMISSION_RATE * 100).toFixed(1)}%</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2 text-right">
                  <Label className="text-xs font-black opacity-70">المبلغ المطلوب (USDT)</Label>
                  <Input type="number" placeholder="0.00" className="h-16 rounded-2xl text-2xl font-black text-right" value={usdtAmount} onChange={(e) => setUsdtAmount(e.target.value)} />
                </div>
                <div className="space-y-2 text-right">
                   <Label className="text-xs font-black opacity-70">محفظة الدفع</Label>
                   <Select value={purchaseCurrency} onValueChange={setPurchaseCurrency}>
                      <SelectTrigger className="h-12 rounded-2xl glass-morphism font-bold"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD (رصيد دولار)</SelectItem>
                        <SelectItem value="YER">YER (رصيد يمني)</SelectItem>
                        <SelectItem value="SAR">SAR (رصيد سعودي)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <div className="p-5 bg-primary/5 rounded-[2rem] border border-primary/10 space-y-2">
                  <div className="flex justify-between font-bold text-sm">
                    <span>التكلفة الإجمالية:</span> 
                    <span className="text-primary font-black">{getUsdtTotal()} {purchaseCurrency}</span>
                  </div>
                </div>
                <Button className="w-full h-16 rounded-[2rem] font-black text-lg shadow-xl active:scale-95 transition-all" disabled={isProcessing} onClick={handleBuyUsdt}>
                  {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : "إتم الشراء الآن"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="digital" className="space-y-6">
            <Accordion type="single" collapsible className="w-full space-y-4">
              {categories.map((cat, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`} className="border-none">
                  <AccordionTrigger className="glass-morphism h-16 px-6 rounded-[1.5rem] font-black text-sm hover:no-underline hover:bg-primary/5 border-none shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl"><Gamepad2 className="h-5 w-5 text-primary" /></div>
                      {cat}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-3 px-2">
                    {products?.filter(p => p.category === cat).map((product) => (
                      <Card key={product.id} className="glass-morphism rounded-2xl border-none shadow-sm group overflow-hidden hover:bg-white/90 transition-colors">
                        <div className="flex items-center p-4 gap-4">
                          <div className="h-16 w-16 bg-muted rounded-xl overflow-hidden shrink-0 border border-primary/5">
                            {product.imageUrl ? (
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20"><Gamepad2 className="h-8 w-8" /></div>
                            )}
                          </div>
                          <div className="flex-1 text-right">
                            <h4 className="font-black text-xs leading-tight">{product.name}</h4>
                            <p className="text-primary font-black text-sm mt-1">{product.price.toLocaleString()} {product.currency}</p>
                          </div>
                          <Button size="sm" className="rounded-xl px-6 font-black h-10 shadow-md" onClick={() => openPurchaseDialog(product)}>شراء</Button>
                        </div>
                      </Card>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-right font-black text-xl flex items-center gap-2 justify-end">
              <ShoppingCart className="h-5 w-5 text-primary" />
              تأكيد عملية الشراء
            </DialogTitle>
            <DialogDescription className="text-right font-bold text-xs opacity-70">
              يرجى تزويدنا بالمعلومات المطلوبة لإتمام عملية الشحن بنجاح.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-6">
            <div className="p-4 bg-muted/40 rounded-2xl text-right space-y-1">
               <p className="text-[10px] font-black uppercase text-muted-foreground">المنتج المختار</p>
               <p className="text-sm font-black">{selectedProduct?.name}</p>
               <p className="text-primary font-black">{selectedProduct?.price} {selectedProduct?.currency}</p>
            </div>
            
            <div className="space-y-2 text-right">
              <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">معرف الشحن (ID) أو البريد الإلكتروني</Label>
              <div className="relative">
                 <UserCheck className="absolute right-4 top-3.5 h-4 w-4 text-muted-foreground" />
                 <Input 
                   placeholder="أدخل الـ ID الخاص بك هنا" 
                   value={shippingId} 
                   onChange={(e) => setShippingId(e.target.value)} 
                   className="pr-12 h-14 rounded-2xl bg-muted/30 border-none font-bold" 
                 />
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 bg-orange-500/5 rounded-xl border border-orange-500/10">
               <Info className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
               <p className="text-[10px] font-bold text-orange-700 leading-relaxed">
                  تأكد من صحة معرف الشحن، لا يمكننا استرداد الأموال في حال إدخال بيانات خاطئة.
               </p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-3">
            <Button 
              onClick={handleFinalizePurchase} 
              disabled={isProcessing || !shippingId.trim()} 
              className="w-full h-14 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
              تأكيد الدفع والطلب
            </Button>
            <Button variant="ghost" onClick={() => setIsPurchaseDialogOpen(false)} className="rounded-2xl font-black">إلغاء</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <ServicesContent />
    </Suspense>
  );
}