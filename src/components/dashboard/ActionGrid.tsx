
"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Send, 
  ArrowDownCircle, 
  History, 
  Users,
  Coins,
  Headset,
  Info,
  Banknote,
  IdCard,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

const actions = [
  { icon: Send, label: 'إرسال', href: '/dashboard/send', color: 'bg-primary/10 text-primary' },
  { icon: ArrowDownCircle, label: 'إيداع', href: '/dashboard/deposit', color: 'bg-green-500/10 text-green-600' },
  { icon: Banknote, label: 'سحب', href: '/dashboard/withdraw', color: 'bg-purple-500/10 text-purple-600' },
  { icon: RefreshCw, label: 'تبادل', href: '/dashboard/exchange', color: 'bg-indigo-500/10 text-indigo-600' },
  { icon: TrendingUp, label: 'استثمار', href: '/dashboard/invest', color: 'bg-emerald-500/10 text-emerald-600' },
  { icon: Coins, label: 'كريبتو', href: '/services', color: 'bg-yellow-500/10 text-yellow-600' },
  { icon: IdCard, label: 'التوثيق', href: '/dashboard/verify', color: 'bg-blue-500/10 text-blue-600' },
  { icon: History, label: 'السجل', href: '/history', color: 'bg-orange-500/10 text-orange-600' },
  { icon: Headset, label: 'الدعم', href: '/support', color: 'bg-slate-500/10 text-slate-600' },
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
            <action.icon className="h-5 w-5" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-none">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}
