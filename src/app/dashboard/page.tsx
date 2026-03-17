
"use client";

import React from 'react';
import { Bell, LogOut, User } from 'lucide-react';
import { BalanceCarousel } from '@/components/dashboard/BalanceCarousel';
import { ActionGrid } from '@/components/dashboard/ActionGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { useWalletStore } from '@/app/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useWalletStore();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <h1 className="text-lg font-bold leading-none">{user.name}</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Wallet Summary */}
      <main className="flex-1 space-y-2 overflow-y-auto">
        <BalanceCarousel />
        
        <div className="px-6 pb-2">
          <div className="bg-accent/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground tracking-wider">UID: {user.uid}</span>
            </div>
            <Button size="sm" variant="ghost" className="text-[10px] h-7 px-2 font-bold uppercase tracking-tight text-primary">Copy</Button>
          </div>
        </div>

        <h3 className="px-6 pt-4 text-lg font-bold">Quick Actions</h3>
        <ActionGrid />
      </main>

      <BottomNav />
    </div>
  );
}
