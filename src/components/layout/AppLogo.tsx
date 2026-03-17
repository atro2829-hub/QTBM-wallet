
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function AppLogo({ className, iconOnly = false }: AppLogoProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div className="relative h-16 w-16 flex items-center justify-center group">
        {/* Professional Digital Wallet Logo */}
        <div className="absolute inset-0 bg-primary/20 rounded-[2rem] blur-xl group-hover:bg-primary/30 transition-all duration-700 animate-pulse" />
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full text-primary drop-shadow-2xl animate-logo-float relative z-10" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Main Wallet Shape */}
          <path d="M20 30 L80 30 L80 75 C80 80, 75 85, 70 85 L30 85 C25 85, 20 80, 20 75 Z" />
          {/* Wallet Fold */}
          <path d="M20 45 L80 45" />
          {/* Digital Signature / Lock Core */}
          <circle cx="50" cy="65" r="10" className="fill-primary/10" />
          <path d="M50 60 L50 70 M45 65 L55 65" strokeWidth="4" />
          {/* Connection Lines */}
          <path d="M35 20 L45 20 M55 20 L65 20" strokeWidth="3" opacity="0.5" />
        </svg>
      </div>
      {!iconOnly && (
        <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-[0.25em] text-foreground bg-clip-text">QTBM</span>
          </div>
          <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-primary to-transparent mt-1" />
          <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-1 opacity-60">Digital Wallet</span>
        </div>
      )}
    </div>
  );
}
