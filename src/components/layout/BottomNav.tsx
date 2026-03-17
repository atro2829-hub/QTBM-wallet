
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, History, Settings, Mic } from 'lucide-react';
import { VoiceCommandDialog } from '@/components/voice/VoiceCommandDialog';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'الرئيسية', href: '/dashboard' },
  { icon: LayoutGrid, label: 'الخدمات', href: '/services' },
  { icon: null, label: '', href: '' }, 
  { icon: History, label: 'السجل', href: '/history' },
  { icon: Settings, label: 'الإعدادات', href: '/settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t z-40 pb-safe shadow-2xl">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative px-2" dir="rtl">
          {navItems.map((item, i) => {
            if (!item.icon) return <div key={i} className="w-12" />;
            
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={i} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground opacity-60 hover:opacity-100"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[3px]")} />
                <span className="text-[10px] mt-1 font-black">{item.label}</span>
              </Link>
            );
          })}
          
          <button 
            onClick={() => setIsVoiceOpen(true)}
            className="absolute left-1/2 -top-8 -translate-x-1/2 bg-primary text-white p-5 rounded-full shadow-2xl shadow-primary/40 active:scale-90 transition-all flex items-center justify-center z-50 ring-4 ring-background"
            aria-label="Voice Command"
          >
            <Mic className="h-7 w-7" />
          </button>
        </div>
      </div>

      <VoiceCommandDialog open={isVoiceOpen} onOpenChange={setIsVoiceOpen} />
    </>
  );
}
