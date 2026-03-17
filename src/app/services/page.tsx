
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, Music, Tv, Gamepad2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNav } from '@/components/layout/BottomNav';
import { useWalletStore, Product } from '@/app/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function ServicesPage() {
  const router = useRouter();
  const { products, user, updateBalance, addTransaction } = useWalletStore();
  const { toast } = useToast();

  const handlePurchase = (product: Product) => {
    if (!user) return;
    
    if (user.balances[product.currency] < product.price) {
      toast({
        title: "Insufficient Balance",
        description: `You need ${product.price} ${product.currency} to purchase ${product.name}.`,
        variant: "destructive",
      });
      return;
    }

    updateBalance(product.currency, -product.price);
    addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      type: 'purchase',
      description: `Bought ${product.name}`,
      amount: product.price,
      currency: product.currency,
      status: 'Completed',
      date: new Date().toISOString(),
    });

    toast({
      title: "Purchase Successful",
      description: `You have successfully purchased ${product.name}.`,
    });
  };

  const getIcon = (iconName: string) => {
    switch(iconName) {
      case 'Music': return <Music className="h-6 w-6 text-pink-500" />;
      case 'Tv': return <Tv className="h-6 w-6 text-red-500" />;
      case 'Gamepad2': return <Gamepad2 className="h-6 w-6 text-blue-500" />;
      default: return <ShoppingCart className="h-6 w-6 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x pb-24">
      <header className="p-4 flex flex-col gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">Services</h1>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search subscriptions, games..." className="pl-10 h-10 bg-accent/50 border-none" />
        </div>
      </header>

      <main className="p-4 space-y-6">
        <div>
          <h2 className="text-lg font-bold mb-4">Popular Subscriptions</h2>
          <div className="grid grid-cols-1 gap-3">
            {products.map((product) => (
              <Card key={product.id} className="shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-accent rounded-2xl">
                      {getIcon(product.icon)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">{product.name}</h3>
                      <p className="text-primary font-bold text-sm">
                        {product.price} {product.currency}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handlePurchase(product)} className="rounded-full px-4 h-8 font-bold">
                    Buy
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Categories</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center space-y-2">
              <Gamepad2 className="h-8 w-8 text-blue-500 mx-auto" />
              <p className="font-bold text-sm">Games</p>
            </div>
            <div className="p-6 bg-pink-500/10 rounded-2xl border border-pink-500/20 text-center space-y-2">
              <Music className="h-8 w-8 text-pink-500 mx-auto" />
              <p className="font-bold text-sm">Music</p>
            </div>
            <div className="p-6 bg-orange-500/10 rounded-2xl border border-orange-500/20 text-center space-y-2">
              <Tv className="h-8 w-8 text-orange-500 mx-auto" />
              <p className="font-bold text-sm">TV & Video</p>
            </div>
            <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20 text-center space-y-2">
              <ShoppingCart className="h-8 w-8 text-primary mx-auto" />
              <p className="font-bold text-sm">Shopping</p>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
