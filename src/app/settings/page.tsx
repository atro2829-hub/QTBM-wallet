"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  User, 
  Shield, 
  Moon, 
  Sun, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Bell,
  Globe,
  Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { BottomNav } from '@/components/layout/BottomNav';
import { useWalletStore } from '@/app/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useWalletStore();
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('EN');

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
  };

  const handleLanguageChange = (val: string) => {
    setLanguage(val);
    document.documentElement.dir = val === 'AR' ? 'rtl' : 'ltr';
    document.documentElement.lang = val.toLowerCase();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{language === 'AR' ? 'الإعدادات' : 'Settings'}</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex flex-col items-center py-4">
          <Avatar className="h-20 w-20 border-2 border-primary/20 mb-3">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200/200`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-bold">{user.name}</h2>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>

        <div className="space-y-4">
          <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Preference</h3>
          <div className="bg-card rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-xl">
                  {darkMode ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-orange-500" />}
                </div>
                <span className="text-sm font-bold">{language === 'AR' ? 'الوضع الليلي' : 'Dark Mode'}</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-xl">
                  <Languages className="h-5 w-5 text-blue-500" />
                </div>
                <span className="text-sm font-bold">{language === 'AR' ? 'اللغة' : 'Language'}</span>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-24 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EN">English</SelectItem>
                  <SelectItem value="AR">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <h3 className="px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Account</h3>
          <div className="bg-card rounded-2xl shadow-sm border divide-y overflow-hidden">
            <div className="p-4 flex items-center justify-between active:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-xl">
                  <User className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-sm font-bold">Profile Info</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-4 flex items-center justify-between active:bg-accent transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-xl">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-sm font-bold">Security</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>

        <Button variant="destructive" className="w-full h-12 rounded-2xl gap-2 font-bold mt-8" onClick={() => router.push('/auth/login')}>
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
