
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Mail, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    <div className="min-h-screen flex items-center justify-center p-6 bg-background mesh-background" dir="rtl">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 bg-primary rounded-[2rem] text-white mb-2 shadow-2xl shadow-primary/30">
            <Wallet className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">تسجيل الدخول</h1>
          <p className="text-muted-foreground font-bold">مرحباً بك في محفظتك الرقمية المتكاملة</p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl rounded-[2.5rem]">
          <CardContent className="pt-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email"
                    placeholder="example@mail.com" 
                    className="pr-10 text-right h-12 rounded-2xl" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <Link href="/auth/forgot-password" className="text-xs text-primary font-black hover:underline">هل نسيت كلمة المرور؟</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pr-10 text-right h-12 rounded-2xl" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl group shadow-xl shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "دخول"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm font-bold text-muted-foreground">
          ليس لديك حساب؟{" "}
          <Link href="/auth/register" className="text-primary font-black hover:underline">سجل الآن مجاناً</Link>
        </p>
      </div>
    </div>
  );
}
