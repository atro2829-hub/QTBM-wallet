
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Mail, Lock, Loader2, Phone, MessageSquare, ShieldCheck, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { AppLogo } from '@/components/layout/AppLogo';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Fetch contact info from system config
  const configRef = useMemoFirebase(() => doc(db, 'system', 'config'), [db]);
  const { data: config } = useDoc(configRef);

  const phone = config?.contactPhone || '775371829';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: "أهلاً بك مجدداً!", description: "تم تسجيل الدخول بنجاح." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ 
        title: "فشل تسجيل الدخول", 
        description: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background mesh-background overflow-y-auto" dir="rtl">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-1000 py-10">
        <div className="text-center space-y-4">
          <div className="inline-block transform hover:scale-105 transition-transform duration-500">
            <AppLogo />
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground">تسجيل الدخول</h1>
            <p className="text-muted-foreground font-bold text-sm">مرحباً بك في بوابتك للمدفوعات الرقمية الآمنة</p>
          </div>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/80 backdrop-blur-2xl rounded-[3rem] overflow-hidden border border-white/20">
          <CardContent className="pt-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label htmlFor="email" className="mr-2 text-xs font-black uppercase tracking-widest opacity-70">البريد الإلكتروني</Label>
                <div className="relative group">
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="example@mail.com" 
                    className="pr-12 text-right h-14 rounded-2xl bg-background/50 border-transparent focus:border-primary/20 transition-all text-lg font-medium" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <div className="flex items-center justify-between px-2">
                  <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest opacity-70">كلمة المرور</Label>
                  <Link href="/auth/forgot-password" weights="bold" className="text-[10px] text-primary font-black hover:underline underline-offset-4">نسيت كلمة المرور؟</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pr-12 text-right h-14 rounded-2xl bg-background/50 border-transparent focus:border-primary/20 transition-all text-lg font-medium" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-16 text-lg font-black rounded-2xl group shadow-2xl shadow-primary/20 active:scale-95 transition-all mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : "دخول آمن"}
              </Button>
            </form>

            <div className="mt-8 text-center pb-2">
              <p className="text-sm font-bold text-muted-foreground">
                ليس لديك حساب؟{" "}
                <Link href="/auth/register" className="text-primary font-black hover:underline underline-offset-4">سجل الآن مجاناً</Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support & Help Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-4 px-4">
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-muted-foreground/20 to-muted-foreground/20" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 whitespace-nowrap">مركز المساعدة</span>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-muted-foreground/20 to-muted-foreground/20" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="h-20 rounded-[2rem] flex flex-col items-center justify-center gap-1 bg-card/40 border-transparent hover:bg-card shadow-sm transition-all"
              onClick={() => router.push('/contact')}
            >
              <Phone className="h-5 w-5 text-green-500" />
              <span className="text-[10px] font-black uppercase tracking-tight">اتصل بنا</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 rounded-[2rem] flex flex-col items-center justify-center gap-1 bg-card/40 border-transparent hover:bg-card shadow-sm transition-all"
              onClick={() => router.push('/support')}
            >
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-tight">الدعم الفني</span>
            </Button>
          </div>

          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="text-[10px] font-black text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
              <ShieldCheck className="h-3 w-3" />
              سياسة الخصوصية
            </Link>
            <button className="text-[10px] font-black text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors" onClick={() => window.open(`tel:${phone}`)}>
              <Phone className="h-3 w-3" />
              {phone}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
