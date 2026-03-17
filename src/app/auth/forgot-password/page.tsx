
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Wallet, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function ForgotPasswordPage() {
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ 
        title: "تم إرسال الرابط", 
        description: "يرجى التحقق من بريدك الإلكتروني لإعادة تعيين كلمة المرور." 
      });
    } catch (error: any) {
      toast({ 
        title: "فشل الإرسال", 
        description: "تأكد من صحة البريد الإلكتروني المدخل.", 
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
          <h1 className="text-3xl font-black tracking-tight">استعادة الحساب</h1>
          <p className="text-muted-foreground font-bold">أدخل بريدك الإلكتروني لإرسال رابط استعادة كلمة المرور</p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl rounded-[2.5rem]">
          <CardContent className="pt-8">
            <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label htmlFor="email">البريد الإلكتروني المسجل</Label>
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

              <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl group shadow-xl shadow-primary/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "إرسال رابط الاستعادة"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link href="/auth/login" className="text-primary font-black hover:underline inline-flex items-center gap-2">
            العودة لتسجيل الدخول
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
