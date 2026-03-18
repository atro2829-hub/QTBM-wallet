
"use client";

import React, { useEffect } from 'react';
import { Bell, LogOut, User, Loader2, Search, ArrowUpRight, ArrowDownLeft, Wallet, Copy, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BalanceCarousel } from '@/components/dashboard/BalanceCarousel';
import { ActionGrid } from '@/components/dashboard/ActionGrid';
import { BottomNav } from '@/components/layout/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { AppLogo } from '@/components/layout/AppLogo';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
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

  if (isUserLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
        <AppLogo className="animate-pulse scale-75" iconOnly />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
          QTBM Secure Core Initializing...
        </p>
      </div>
    );
  }

  if (!user) return null;

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    toast({ title: "تم النسخ", description: "تم نسخ معرف المستخدم الخاص بك بنجاح." });
  };

  const isVerified = profile?.verificationStatus === 'approved';
  const isPending = profile?.verificationStatus === 'pending';

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x shadow-2xl page-transition">
      <header className="p-6 pb-2 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="relative group cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
            <Avatar className="h-12 w-12 border-2 border-primary/20 ring-4 ring-background transition-transform group-hover:scale-110 shadow-lg">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/100/100`} />
              <AvatarFallback className="bg-primary/10 text-primary font-black">{profile?.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-1 -right-1 h-5 w-5 border-2 border-background rounded-full shadow-sm flex items-center justify-center",
              isVerified ? "bg-green-500" : "bg-orange-500"
            )}>
              {isVerified ? <CheckCircle2 className="h-3 w-3 text-white" /> : <ShieldCheck className="h-3 w-3 text-white" />}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-70">
              {profile?.preferredLanguage === 'AR' ? 'مرحباً بك،' : 'Verified Account'}
            </p>
            <h1 className="text-lg font-black leading-none truncate max-w-[150px] tracking-tight">{profile?.fullName}</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <AppLogo iconOnly className="h-10 w-10 opacity-90" />
        </div>
      </header>

      <main className="flex-1 space-y-6 overflow-y-auto pt-4 scroll-smooth pb-28">
        {!isVerified && !isPending && (
          <div className="px-6">
             <div 
              className="bg-orange-500/10 border border-orange-500/20 rounded-[2rem] p-4 flex items-center justify-between cursor-pointer group hover:bg-orange-500/20 transition-all"
              onClick={() => router.push('/dashboard/verify')}
             >
                <div className="flex items-center gap-3">
                   <AlertTriangle className="h-5 w-5 text-orange-600 animate-pulse" />
                   <div>
                      <p className="text-xs font-black text-orange-700">حسابك غير موثق</p>
                      <p className="text-[10px] font-bold text-orange-600/70">وثق هويتك لتفعيل كافة الميزات</p>
                   </div>
                </div>
                <ArrowUpRight className="h-5 w-5 text-orange-600 group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        )}

        {isPending && (
          <div className="px-6">
             <div className="bg-blue-500/10 border border-blue-500/20 rounded-[2rem] p-4 flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <div>
                    <p className="text-xs font-black text-blue-700">طلب التوثيق قيد المراجعة</p>
                    <p className="text-[10px] font-bold text-blue-600/70">سيتم تفعيل حسابك فور مطابقة الوثائق</p>
                </div>
             </div>
          </div>
        )}

        <BalanceCarousel />
        
        <div className="px-6">
          <div className="glass-morphism rounded-[2.5rem] p-5 flex items-center justify-between relative overflow-hidden group border-white/40 shadow-xl shadow-primary/5">
            <div className="absolute -right-4 -top-4 h-24 w-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-inner group-hover:rotate-12 transition-transform">
                <Wallet className="h-6 w-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Digital Key</span>
                <span className="text-xs font-mono font-bold tracking-tighter truncate max-w-[140px] uppercase">{user.uid.slice(0, 12)}...</span>
              </div>
            </div>
            <Button size="sm" variant="secondary" className="rounded-xl h-9 text-[10px] font-black uppercase tracking-widest px-4 shadow-sm active:scale-95 transition-all" onClick={copyUid}>
              <Copy className="h-3 w-3 mr-1" />
              Copy
            </Button>
          </div>
        </div>

        <section className="px-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">{profile?.preferredLanguage === 'AR' ? 'إجراءات سريعة' : 'Quick Actions'}</h3>
          </div>
          <ActionGrid />
        </section>

        <section className="px-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black tracking-tight">{profile?.preferredLanguage === 'AR' ? 'عروض حصرية' : 'Exclusive Offers'}</h3>
          </div>
          <div className="glass-morphism rounded-[2.5rem] p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent border-primary/10 hover:shadow-2xl hover:shadow-primary/5 transition-all group cursor-pointer" onClick={() => router.push('/services')}>
            <div className="flex gap-5">
              <div className="h-20 w-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <ArrowUpRight className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-sm tracking-tight">سوق الكريبتو النشط</h4>
                  <span className="text-[8px] bg-primary text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">مباشر</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed font-bold opacity-80">اشترِ USDT فوراً بأفضل سعر في السوق المحلي. تسوية تلقائية في ثوانٍ.</p>
                <div className="flex items-center gap-1 text-xs font-black text-primary uppercase tracking-widest group-hover:gap-2 transition-all">
                   ابدأ الآن <span>→</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
