
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wallet } from 'lucide-react';

export default function SplashPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/auth/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-white p-6 overflow-hidden">
      <div className="relative animate-in fade-in zoom-in duration-1000">
        <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md mb-6 ring-1 ring-white/20">
          <Wallet className="h-20 w-20" />
        </div>
        {/* Subtle decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 bg-white/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse delay-700" />
      </div>
      
      <div className="text-center space-y-2 animate-in slide-in-from-bottom duration-1000">
        <h1 className="text-4xl font-extrabold tracking-tighter">QTBM Wallet</h1>
        <p className="text-white/70 font-medium">Your Modern Financial Companion</p>
      </div>
      
      <div className="mt-20">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
