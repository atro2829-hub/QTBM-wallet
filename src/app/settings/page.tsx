
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  User, 
  Shield, 
  Moon, 
  Sun, 
  LogOut, 
  ChevronLeft,
  Languages,
  Loader2,
  Bell,
  Wallet,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { BottomNav } from '@/components/layout/BottomNav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  
  const userProfileRef = React.useMemo(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('AR');

  useEffect(() => {
    if (profile) {
      setDarkMode(profile.preferredTheme === 'dark');
      setLanguage(profile.preferredLanguage || 'AR');
      
      document.documentElement.classList.toggle('dark', profile.preferredTheme === 'dark');
      document.documentElement.dir = profile.preferredLanguage === 'AR' ? 'rtl' : 'ltr';
      document.documentElement.lang = (profile.preferredLanguage || 'AR').toLowerCase();
    }
  }, [profile]);

  const toggleDarkMode = async (checked: boolean) => {
    if (!user) return;
    setDarkMode(checked);
    await updateDoc(doc(db, 'users', user.uid), {
      preferredTheme: checked ? 'dark' : 'light'
    });
  };

  const handleLanguageChange = async (val: string) => {
    if (!user) return;
    setLanguage(val);
    await updateDoc(doc(db, 'users', user.uid), {
      preferredLanguage: val
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth/login');
  };

  if (isProfileLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x pb-24" dir="rtl">
      <header className="p-6 pb-2 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <h1 className="text-2xl font-black tracking-tight">{language === 'AR' ? 'الإعدادات' : 'Settings'}</h1>
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        <div className="flex flex-col items-center py-6 group cursor-pointer" onClick={() => router.push('/dashboard/profile')}>
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-primary/20 ring-4 ring-background shadow-2xl transition-transform group-hover:scale-105">
              <AvatarImage src={`https://picsum.photos/seed/${user.uid}/200/200`} />
              <AvatarFallback className="bg-primary/10 text-primary font-black text-2xl">{profile.fullName?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 p-2 bg-primary text-white rounded-full border-4 border-background shadow-lg">
              <User className="h-4 w-4" />
            </div>
          </div>
          <h2 className="text-xl font-black mt-4">{profile.fullName}</h2>
          <p className="text-xs font-bold text-muted-foreground opacity-60 tracking-wider uppercase">الحساب موثق</p>
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">التفضيلات</h3>
            <div className="bg-card/50 glass-morphism rounded-[2.5rem] border-none shadow-sm overflow-hidden divide-y divide-border/50">
              <div className="p-5 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${darkMode ? 'bg-indigo-500/10 text-indigo-500' : 'bg-orange-500/10 text-orange-500'}`}>
                    {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  </div>
                  <span className="font-bold text-sm">{language === 'AR' ? 'المظهر الليلي' : 'Dark Mode'}</span>
                </div>
                <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
              </div>

              <div className="p-5 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                    <Languages className="h-5 w-5" />
                  </div>
                  <span className="font-bold text-sm">{language === 'AR' ? 'اللغة' : 'Language'}</span>
                </div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-28 h-10 text-xs font-black rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EN">English</SelectItem>
                    <SelectItem value="AR">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="px-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">إدارة الحساب</h3>
            <div className="bg-card/50 glass-morphism rounded-[2.5rem] border-none shadow-sm overflow-hidden divide-y divide-border/50">
              <div 
                className="p-5 flex items-center justify-between active:bg-accent/50 transition-all cursor-pointer group"
                onClick={() => router.push('/dashboard/profile')}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">تعديل الملف الشخصي</span>
                    <span className="text-[10px] text-muted-foreground font-bold">الاسم، الهاتف، العنوان</span>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
              </div>

              <div className="p-5 flex items-center justify-between active:bg-accent/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 text-green-600 rounded-2xl">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">الأمان والخصوصية</span>
                    <span className="text-[10px] text-muted-foreground font-bold">تغيير كلمة المرور، المصادقة</span>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
              </div>

              <div className="p-5 flex items-center justify-between active:bg-accent/50 transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/10 text-purple-600 rounded-2xl">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">الإشعارات</span>
                    <span className="text-[10px] text-muted-foreground font-bold">تنبيهات العمليات، العروض</span>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground group-hover:-translate-x-1 transition-transform" />
              </div>
            </div>
          </section>
        </div>

        <Button 
          variant="destructive" 
          className="w-full h-16 rounded-[2rem] gap-3 font-black text-lg shadow-2xl shadow-destructive/20 active:scale-95 transition-all mt-6" 
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          تسجيل الخروج
        </Button>
      </main>

      <BottomNav />
    </div>
  );
}
