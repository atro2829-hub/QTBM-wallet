"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Send, 
  ArrowDownCircle, 
  LayoutGrid, 
  History, 
  Settings, 
  Smartphone, 
  CreditCard, 
  ShieldCheck, 
  Users,
  Coins
} from 'lucide-react';

const actions = [
  { icon: Send, label: 'Send Money', href: '/dashboard/send', color: 'bg-primary/10 text-primary' },
  { icon: ArrowDownCircle, label: 'Deposit', href: '/dashboard/deposit', color: 'bg-green-500/10 text-green-600' },
  { icon: Coins, label: 'Crypto', href: '/services', color: 'bg-yellow-500/10 text-yellow-600' },
  { icon: LayoutGrid, label: 'Services', href: '/services', color: 'bg-blue-500/10 text-blue-600' },
  { icon: History, label: 'History', href: '/history', color: 'bg-orange-500/10 text-orange-600' },
  { icon: Users, label: 'Friends', href: '/dashboard/friends', color: 'bg-pink-500/10 text-pink-600' },
  { icon: CreditCard, label: 'Cards', href: '#', color: 'bg-gray-500/10 text-gray-600' },
  { icon: ShieldCheck, label: 'Security', href: '/settings', color: 'bg-cyan-500/10 text-cyan-600' },
  { icon: Settings, label: 'Settings', href: '/settings', color: 'bg-slate-500/10 text-slate-600' },
];

export function ActionGrid() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {actions.map((action, i) => (
        <Link 
          key={i} 
          href={action.href}
          className="flex flex-col items-center justify-center p-4 bg-card/40 glass-morphism rounded-[2rem] border-transparent hover:border-primary/20 transition-all active:scale-95 group shadow-sm"
        >
          <div className={`p-3 rounded-2xl mb-2 transition-transform group-hover:scale-110 ${action.color}`}>
            <action.icon className="h-6 w-6" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}