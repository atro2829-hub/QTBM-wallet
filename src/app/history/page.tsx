
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWalletStore, Transaction } from '@/app/lib/store';
import { BottomNav } from '@/components/layout/BottomNav';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function HistoryPage() {
  const router = useRouter();
  const { transactions } = useWalletStore();

  const getIcon = (type: Transaction['type']) => {
    switch(type) {
      case 'send': return <ArrowUpRight className="h-5 w-5 text-red-500" />;
      case 'receive': return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'deposit': return <ArrowDownLeft className="h-5 w-5 text-green-500" />;
      case 'purchase': return <ShoppingBag className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'Pending': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
      case 'Failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x pb-20">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Transaction History</h1>
      </header>

      <main className="flex-1 overflow-y-auto">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground opacity-50">
            <Clock className="h-16 w-16 mb-4" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <div className="divide-y">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 flex items-center gap-4 active:bg-accent transition-colors">
                <div className="p-3 bg-accent rounded-full shrink-0">
                  {getIcon(tx.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold truncate text-sm">{tx.description}</h3>
                    <span className={cn(
                      "font-bold text-sm",
                      tx.type === 'send' || tx.type === 'purchase' ? "text-red-500" : "text-green-500"
                    )}>
                      {tx.type === 'send' || tx.type === 'purchase' ? '-' : '+'}
                      {tx.amount.toLocaleString()} {tx.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                    <span>{format(new Date(tx.date), 'MMM dd, yyyy • HH:mm')}</span>
                    <span className={cn("px-2 py-0.5 rounded-full font-bold uppercase tracking-wider", getStatusColor(tx.status))}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
