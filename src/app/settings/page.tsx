
"use client";

import React from 'react';
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
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { BottomNav } from '@/components/layout/BottomNav';
import { useWalletStore } from '@/app/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useWalletStore();
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  if (!user) return null;

  const settingsItems = [
    { icon: User, label: 'Profile Information', sub: 'Name, Email, UID' },
    { icon: Bell, label: 'Notifications', sub: 'Transaction alerts' },
    { icon: Shield, label: 'Security', sub: 'Password, Biometrics' },
    { icon: Globe, label: 'Language', sub: 'English (US)' },
    { icon: HelpCircle, label: 'Support & Help', sub: 'FAQs, Contact' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x pb-24">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-8">
        {/* Profile Card */}
        <div className="flex flex-col items-center py-6">
          <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-xl mb-4">
            <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200/200`} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{user.name}</h2>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <div className="mt-4 px-3 py-1 bg-accent rounded-full text-[10px] font-bold tracking-widest text-muted-foreground">
            UID: {user.uid}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="px-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">General</h3>
          <div className="bg-card rounded-2xl shadow-sm border divide-y overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent rounded-xl">
                  {darkMode ? <Moon className="h-5 w-5 text-indigo-500" /> : <Sun className="h-5 w-5 text-orange-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">Toggle app appearance</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>

            {settingsItems.map((item, i) => (
              <div key={i} className="p-4 flex items-center justify-between active:bg-accent transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent rounded-xl text-slate-600">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button variant="destructive" className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg shadow-destructive/10">
            <LogOut className="h-5 w-5" />
            Log Out
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
