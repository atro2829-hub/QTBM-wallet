
"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { cn } from '@/lib/utils';

export function BalanceCarousel() {
  const { user } = useUser();
  const db = useFirestore();
  const [showBalances, setShowBalances] = useState(true);

  const walletRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  if (!user || !wallet) return null;

  const currencies = [
    { code: 'USD', label: 'US Dollar', symbol: '$', balance: wallet.usdBalance, style: 'balance-card-gradient text-white' },
    { code: 'YER', label: 'Yemeni Rial', symbol: '﷼', balance: wallet.yerBalance, style: 'balance-card-dark text-white' },
    { code: 'SAR', label: 'Saudi Riyal', symbol: 'SR', balance: wallet.sarBalance, style: 'balance-card-dark text-white' },
  ];

  return (
    <div className="w-full px-4 py-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/60">Digital Assets</h2>
        <button 
          onClick={() => setShowBalances(!showBalances)}
          className="p-2.5 hover:bg-primary/10 rounded-2xl transition-all active:scale-90 bg-card/50 glass-morphism border-none"
        >
          {showBalances ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      
      <Carousel 
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          dragFree: false,
        }}
        className="w-full max-w-md mx-auto"
      >
        <CarouselContent className="-ml-4">
          {currencies.map((currency) => (
            <CarouselItem key={currency.code} className="pl-4 basis-[92%] transition-all duration-500">
              <Card className={cn("border-none overflow-hidden relative rounded-[2.5rem] h-48 group shadow-2xl", currency.style)}>
                <CardContent className="p-8 h-full flex flex-col justify-between">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-125 transition-transform duration-700">
                    <Sparkles className="h-12 w-12" />
                  </div>
                  
                  <div className="flex justify-between items-start z-10">
                    <div>
                      <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.3em]">{currency.label}</p>
                      <h3 className="text-2xl font-black tracking-tight mt-1">{currency.code}</h3>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-xl border border-white/20 shadow-lg">
                      <span className="text-xl font-black">{currency.symbol}</span>
                    </div>
                  </div>
                  
                  <div className="z-10">
                    <p className="text-4xl font-black tracking-tighter transition-all duration-300">
                      {showBalances 
                        ? (currency.balance || 0).toLocaleString()
                        : '••••••••'
                      }
                    </p>
                    <p className="text-white/50 text-[10px] font-bold mt-2 uppercase tracking-widest">Available Balance</p>
                  </div>

                  {/* Geometric Wave SVG Background */}
                  <div className="absolute -bottom-10 -left-10 opacity-10 pointer-events-none transition-all duration-700 group-hover:scale-150">
                    <svg width="200" height="200" viewBox="0 0 100 100">
                      <circle cx="0" cy="100" r="80" fill="white" />
                      <circle cx="0" cy="100" r="60" fill="white" />
                      <circle cx="0" cy="100" r="40" fill="white" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
