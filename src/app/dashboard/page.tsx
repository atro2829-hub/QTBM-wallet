"use client";

import React, { useEffect } from 'react';
import { Bell, LogOut, User, Loader2, Search, ArrowUpRight, ArrowDownLeft, Wallet } from 'lucide-react';
import { BalanceCarousel } from '@/components/dashboard/BalanceCarousel';
import { ActionGrid } from '@/components/dashboard/ActionGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const userProfileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);

  useEffect(() => {
    if (profile) {
      document.documentElement.dir = profile.preferredLanguage === 'AR' ? 'rtl' : 'ltr';
      document.documentElement.lang = (profile.preferredLanguage || 'EN').toLowerCase();
      document.documentElement.classList.toggle('dark', profile.preferredTheme === 'dark');
    }
  }, [profile]);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  if (isUserLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <div className="relative">
          <Loader2 className="animate-spin h-12 w-12 text-primary" />
          <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse tracking-wide">QTBM Secure Core Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x shadow-2xl">
      <header className="p-6 pb-2 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-12 w-12 border-2 border-primary/20 ring-4 ring-background">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">{profile?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              {profile?.preferredLanguage === 'AR' ? 'مرحباً بك،' : 'Verified Account'}
            </p>
            <h1 className="text-lg font-black leading-none truncate max-w-[150px] tracking-tight">{profile?.fullName}</h1>
          </div>
        </div>
        
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/10 transition-colors">
            <Bell className="h-5 w-5" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full hover:bg-destructive/10 text-destructive/80 transition-colors" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-6 overflow-y-auto pt-4">
        <BalanceCarousel />
        
        <div className="px-6">
          <div className="glass-morphism rounded-3xl p-5 flex items-center justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 h-16 w-16 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner">
                <Wallet className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Digital Signature</span>
                <span className="text-xs font-mono font-bold tracking-tighter truncate max-w-[140px]">{user.uid}</span>
              </div>
            </div>
            <Button size="sm" variant="secondary" className="rounded-xl h-8 text-[10px] font-black uppercase tracking-widest px-4 shadow-sm active:scale-95 transition-transform" onClick={() => {
              navigator.clipboard.writeText(user.uid);
            }}>Copy</Button>
          </div>
        </div>

        <section className="px-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">{profile?.preferredLanguage === 'AR' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
            <span className="text-xs font-bold text-primary hover:underline cursor-pointer">View All</span>
          </div>
          <ActionGrid />
        </section>

        <section className="px-6 pb-24 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">{profile?.preferredLanguage === 'AR' ? 'العروض المميزة' : 'Featured Services'}</h3>
          </div>
          <div className="glass-morphism rounded-3xl p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <div className="flex gap-4">
              <div className="h-20 w-20 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                <ArrowUpRight className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm">Crypto Exchange Ready</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">Instantly buy USDT and other digital assets with local Yemeni Rial and Saudi Rial balances.</p>
                <Button variant="link" className="p-0 h-auto text-xs font-bold text-primary" onClick={() => router.push('/services')}>Get Started →</Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}