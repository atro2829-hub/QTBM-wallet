"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Music, Tv, Gamepad2, ShoppingCart, Coins, Info, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BottomNav } from '@/components/layout/BottomNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export default function ServicesPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [usdtAmount, setUsdtAmount] = useState('');
  
  // Real-time collections
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products } = useCollection(productsQuery);

  const walletRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  const COMMISSION_RATE = 0.05;
  const usdtTotal = usdtAmount ? (parseFloat(usdtAmount) * (1 + COMMISSION_RATE)).toFixed(2) : '0.00';

  const handleBuyUsdt = async () => {
    if (!user || !wallet) return;
    const amount = parseFloat(usdtAmount);
    const totalWithCommission = parseFloat(usdtTotal);

    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", variant: "destructive" });
      return;
    }

    if (wallet.usdBalance < totalWithCommission) {
      toast({ title: "Insufficient Balance", description: `You need ${totalWithCommission} USD to complete this purchase.`, variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      // Log transaction
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'purchase',
        amount: totalWithCommission,
        currency: 'USD',
        description: `Purchased ${amount} USDT (Incl. 5% fee)`,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      toast({ title: "Purchase Successful", description: `You have successfully purchased ${amount} USDT.` });
      setUsdtAmount('');
    } catch (error: any) {
      toast({ title: "Transaction Failed", description: error.message, variant: "destructive" });
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
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x pb-24 shadow-2xl">
      <header className="p-6 pb-2 flex flex-col gap-4 sticky top-0 bg-background/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-2xl font-black tracking-tight">Entertainment</h1>
        </div>
        <div className="relative group">
          <div className="absolute inset-0 bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
          <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search games, crypto, services..." className="pl-12 h-11 bg-card/50 glass-morphism border-none rounded-2xl" />
        </div>
      </header>

      <main className="p-6 space-y-8 flex-1 overflow-y-auto">
        <Tabs defaultValue="crypto" className="w-full">
          <TabsList className="w-full h-12 glass-morphism p-1 rounded-2xl bg-card/30">
            <TabsTrigger value="crypto" className="flex-1 rounded-xl font-bold">Crypto Assets</TabsTrigger>
            <TabsTrigger value="digital" className="flex-1 rounded-xl font-bold">Digital Services</TabsTrigger>
          </TabsList>

          <TabsContent value="crypto" className="mt-6 space-y-6">
            <Card className="glass-morphism border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-transparent overflow-hidden rounded-[2.5rem]">
              <CardHeader className="relative">
                <div className="absolute -right-8 -top-8 h-32 w-32 bg-yellow-500/10 rounded-full blur-3xl" />
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-yellow-500/20 rounded-xl">
                    <Coins className="h-5 w-5 text-yellow-600" />
                  </div>
                  Buy USDT
                </CardTitle>
                <CardDescription>Instant purchase with 5% commission</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="usdt" className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Amount (USDT)</Label>
                  <div className="relative">
                    <Input 
                      id="usdt" 
                      type="number" 
                      placeholder="Enter amount" 
                      className="h-14 bg-white/5 border-white/20 rounded-2xl text-xl font-black pl-5"
                      value={usdtAmount}
                      onChange={(e) => setUsdtAmount(e.target.value)}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground bg-accent px-3 py-1 rounded-lg">USDT</div>
                  </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-2xl space-y-3 border border-primary/10">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Price</span>
                    <span>{usdtAmount || '0'} USD</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-muted-foreground">Commission (5%)</span>
                    <span className="text-primary">+{(parseFloat(usdtTotal) - (parseFloat(usdtAmount) || 0)).toFixed(2)} USD</span>
                  </div>
                  <div className="border-t border-dashed border-primary/20 pt-3 flex justify-between">
                    <span className="text-sm font-black">Total Cost</span>
                    <span className="text-sm font-black text-primary">{usdtTotal} USD</span>
                  </div>
                </div>

                <Button className="w-full h-14 rounded-2xl font-black text-md shadow-lg shadow-primary/20" disabled={isProcessing} onClick={handleBuyUsdt}>
                  {isProcessing ? <Loader2 className="animate-spin" /> : "Purchase USDT Now"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass-morphism p-5 rounded-[2rem] space-y-3 text-center active:scale-95 transition-transform cursor-pointer">
                <div className="h-12 w-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Gamepad2 className="h-6 w-6 text-blue-500" />
                </div>
                <p className="font-black text-xs tracking-tight">Game Cards</p>
              </div>
              <div className="glass-morphism p-5 rounded-[2rem] space-y-3 text-center active:scale-95 transition-transform cursor-pointer">
                <div className="h-12 w-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-purple-500" />
                </div>
                <p className="font-black text-xs tracking-tight">Premium Sub</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="digital" className="mt-6 space-y-6">
             <div className="grid grid-cols-1 gap-4">
               {products?.map((product) => (
                 <Card key={product.id} className="glass-morphism rounded-3xl border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] group overflow-hidden">
                   <CardContent className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <div className="p-3 bg-accent/50 rounded-2xl group-hover:bg-primary/10 transition-colors">
                         {getIcon(product.iconName || 'ShoppingCart')}
                       </div>
                       <div>
                         <h3 className="font-black text-sm tracking-tight">{product.name}</h3>
                         <p className="text-primary font-black text-xs">
                           {product.price} {product.currency}
                         </p>
                       </div>
                     </div>
                     <Button size="sm" className="rounded-xl px-5 h-9 font-black shadow-sm" onClick={() => {
                        // Implement purchase logic
                        toast({ title: "Redirecting...", description: `Proceeding to checkout for ${product.name}` });
                     }}>
                       Buy
                     </Button>
                   </CardContent>
                 </Card>
               ))}
               {(!products || products.length === 0) && (
                 <div className="py-20 text-center space-y-4 opacity-50">
                    <Info className="h-12 w-12 mx-auto" />
                    <p className="text-sm font-bold">No products available in this section.</p>
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