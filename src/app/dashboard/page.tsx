"use client";

import React, { useEffect } from 'react';
import { Bell, LogOut, User, Loader2 } from 'lucide-react';
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

export default function Dashboard() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { user, isUserLoading } = useUser();

  const userProfileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);

  // Apply language settings on load
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Synchronizing secure wallet...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
        <h2 className="text-xl font-bold">Finalizing Setup</h2>
        <p className="text-muted-foreground">We're preparing your multi-currency accounts. This usually takes just a few seconds.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x">
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
            <AvatarFallback>{profile.fullName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-xs text-muted-foreground">{profile.preferredLanguage === 'AR' ? 'مرحباً بك،' : 'Welcome back,'}</p>
            <h1 className="text-lg font-bold leading-none truncate max-w-[150px]">{profile.fullName}</h1>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" className="relative rounded-full">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full ring-2 ring-background" />
          </Button>
          <Button size="icon" variant="ghost" className="rounded-full" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex-1 space-y-2 overflow-y-auto">
        <BalanceCarousel />
        
        <div className="px-6 pb-2">
          <div className="bg-accent/50 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <User className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground tracking-wider truncate max-w-[180px]">UID: {user.uid}</span>
            </div>
            <Button size="sm" variant="ghost" className="text-[10px] h-7 px-2 font-bold uppercase tracking-tight text-primary" onClick={() => {
              navigator.clipboard.writeText(user.uid);
            }}>Copy</Button>
          </div>
        </div>

        <h3 className="px-6 pt-4 text-lg font-bold">{profile.preferredLanguage === 'AR' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
        <ActionGrid />
      </main>

      <BottomNav />
    </div>
  );
}
