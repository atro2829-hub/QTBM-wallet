
"use client";

import React from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function AppLogo({ className, iconOnly = false }: AppLogoProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2", className)}>
      <div className="relative h-12 w-12 flex items-center justify-center">
        {/* Geometric Star Logo SVG - Mimicking the provided image */}
        <svg viewBox="0 0 100 100" className="w-full h-full text-primary drop-shadow-xl" fill="currentColor">
          <path d="M50 0 L60 30 L90 30 L65 50 L75 80 L50 60 L25 80 L35 50 L10 30 L40 30 Z" />
          <rect x="45" y="35" width="10" height="30" rx="2" className="text-background" />
          <path d="M40 70 L50 85 L60 70 Z" className="text-primary" />
        </svg>
      </div>
      {!iconOnly && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <div className="h-[2px] w-4 bg-muted-foreground/30" />
            <span className="text-xl font-black tracking-[0.2em] text-foreground">QTBM</span>
            <div className="h-[2px] w-4 bg-muted-foreground/30" />
          </div>
        </div>
      )}
    </div>
  );
}
