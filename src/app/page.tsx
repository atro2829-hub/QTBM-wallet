
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLogo } from '@/components/layout/AppLogo';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background mesh-background p-6 overflow-hidden">
      <div className="relative flex flex-col items-center">
        <div className="animate-in zoom-in fade-in duration-1000">
          <AppLogo />
        </div>
        
        {/* Subtle decorative background glow */}
        <div className="absolute -z-10 w-64 h-64 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
      </div>
      
      <div className="mt-24 space-y-6 flex flex-col items-center">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '200ms' }} />
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '400ms' }} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground animate-pulse">
          Secure Core Initializing
        </p>
      </div>
    </div>
  );
}
