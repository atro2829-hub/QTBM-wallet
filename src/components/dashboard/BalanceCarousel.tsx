
"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
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
    <div className="w-full px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Your Balances</h2>
        <button 
          onClick={() => setShowBalances(!showBalances)}
          className="p-2 hover:bg-accent rounded-full transition-colors"
        >
          {showBalances ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      <Carousel className="w-full max-w-md mx-auto">
        <CarouselContent className="-ml-2 md:-ml-4">
          {currencies.map((currency) => (
            <CarouselItem key={currency.code} className="pl-2 md:pl-4 basis-11/12">
              <Card className={cn("border-none overflow-hidden relative shadow-lg h-44", currency.style)}>
                <CardContent className="p-6 h-full flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/70 text-sm font-medium">{currency.label}</p>
                      <h3 className="text-xl font-bold">{currency.code}</h3>
                    </div>
                    <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
                      <span className="text-lg font-bold">{currency.symbol}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-3xl font-extrabold tracking-tight">
                      {showBalances 
                        ? (currency.balance || 0).toLocaleString()
                        : '••••••••'
                      }
                    </p>
                    <p className="text-white/60 text-xs mt-1">Available Balance</p>
                  </div>

                  <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <svg width="150" height="150" viewBox="0 0 100 100">
                      <circle cx="100" cy="0" r="80" fill="white" />
                      <circle cx="100" cy="0" r="60" fill="white" />
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
