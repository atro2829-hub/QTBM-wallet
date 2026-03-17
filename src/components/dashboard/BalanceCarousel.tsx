
"use client";

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { useWalletStore, Currency } from '@/app/lib/store';
import { cn } from '@/lib/utils';

export function BalanceCarousel() {
  const { user } = useWalletStore();
  const [showBalances, setShowBalances] = useState(true);

  if (!user) return null;

  const currencies: { code: Currency; label: string; symbol: string; style: string }[] = [
    { code: 'USD', label: 'US Dollar', symbol: '$', style: 'balance-card-gradient text-white' },
    { code: 'YER', label: 'Yemeni Rial', symbol: '﷼', style: 'balance-card-dark text-white' },
    { code: 'SAR', label: 'Saudi Riyal', symbol: 'SR', style: 'balance-card-dark text-white' },
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
                        ? user.balances[currency.code].toLocaleString()
                        : '••••••••'
                      }
                    </p>
                    <p className="text-white/60 text-xs mt-1">Available Balance</p>
                  </div>

                  {/* Subtle pattern background */}
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
