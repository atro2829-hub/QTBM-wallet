
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, History, Settings, Mic } from 'lucide-react';
import { VoiceCommandDialog } from '@/components/voice/VoiceCommandDialog';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', href: '/dashboard' },
  { icon: LayoutGrid, label: 'Services', href: '/services' },
  { icon: null, label: '', href: '' }, // Spacer for the center button
  { icon: History, label: 'History', href: '/history' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t z-40 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto relative px-2">
          {navItems.map((item, i) => {
            if (!item.icon) return <div key={i} className="w-12" />;
            
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={i} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-[10px] mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          <button 
            onClick={() => setIsVoiceOpen(true)}
            className="absolute left-1/2 -top-6 -translate-x-1/2 bg-primary text-white p-4 rounded-full shadow-lg shadow-primary/30 active:scale-90 transition-transform flex items-center justify-center z-50 ring-4 ring-background"
            aria-label="Voice Command"
          >
            <Mic className="h-6 w-6" />
          </button>
        </div>
      </div>

      <VoiceCommandDialog open={isVoiceOpen} onOpenChange={setIsVoiceOpen} />
    </>
  );
}
