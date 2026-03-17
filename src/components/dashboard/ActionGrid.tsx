
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
  Users 
} from 'lucide-react';

const actions = [
  { icon: Send, label: 'Send Money', href: '/dashboard/send', color: 'text-primary' },
  { icon: ArrowDownCircle, label: 'Deposit', href: '/dashboard/deposit', color: 'text-green-500' },
  { icon: LayoutGrid, label: 'Services', href: '/services', color: 'text-blue-500' },
  { icon: History, label: 'History', href: '/history', color: 'text-orange-500' },
  { icon: Smartphone, label: 'Recharge', href: '/services', color: 'text-purple-500' },
  { icon: CreditCard, label: 'My Cards', href: '#', color: 'text-gray-500' },
  { icon: ShieldCheck, label: 'Security', href: '/settings', color: 'text-cyan-500' },
  { icon: Users, label: 'Friends', href: '#', color: 'text-pink-500' },
  { icon: Settings, label: 'Settings', href: '/settings', color: 'text-slate-500' },
];

export function ActionGrid() {
  return (
    <div className="grid grid-cols-3 gap-4 px-4 pb-24">
      {actions.map((action, i) => (
        <Link 
          key={i} 
          href={action.href}
          className="flex flex-col items-center justify-center p-4 bg-card rounded-2xl shadow-sm border border-transparent hover:border-primary/20 transition-all active:scale-95"
        >
          <div className={`p-3 rounded-xl bg-accent mb-2 ${action.color}`}>
            <action.icon className="h-6 w-6" />
          </div>
          <span className="text-xs font-semibold text-center">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
