
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wallet, Mail, Lock, User, IdCard, Phone, MapPin, Building2, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp } from 'firebase/firestore';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const db = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    nationalId: '',
    password: '',
    confirmPassword: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "خطأ في كلمة المرور", description: "تأكد من تطابق كلمات المرور.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: formData.fullName });

      const userProfileRef = doc(db, 'users', user.uid);
      setDocumentNonBlocking(userProfileRef, {
        id: user.uid,
        email: formData.email,
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        address: formData.address,
        city: formData.city,
        nationalIdNumber: formData.nationalId,
        preferredTheme: 'light',
        preferredLanguage: 'AR',
        role: 'user', // Default is now 'user'. Change manually in console to 'admin' for testing.
        verificationStatus: 'none',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      const walletRef = doc(db, 'users', user.uid, 'wallet', 'wallet');
      setDocumentNonBlocking(walletRef, {
        id: 'wallet',
        userId: user.uid,
        yerBalance: 0,
        usdBalance: 0,
        sarBalance: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      toast({ title: "تم إنشاء الحساب", description: "مرحباً بك في محفظة QTBM!" });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ 
        title: "فشل التسجيل", 
        description: error.message || "حدث خطأ أثناء التسجيل.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background mesh-background overflow-y-auto">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700 py-10">
        <div className="text-center space-y-2">
           <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary rounded-[2rem] text-white shadow-2xl shadow-primary/30">
                <Wallet className="h-10 w-10" />
              </div>
           </div>
          <h1 className="text-3xl font-black tracking-tight">إنشاء حساب جديد</h1>
          <p className="text-muted-foreground font-bold">انضم إلى مجتمع QTBM للمدفوعات الرقمية</p>
        </div>

        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl rounded-[2.5rem]">
          <CardContent className="pt-8">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2 text-right">
                <Label htmlFor="fullName">الاسم القانوني الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input 
                    id="fullName" 
                    placeholder="أدخل اسمك كما في الهوية" 
                    className="flex h-12 w-full pr-10 text-right bg-background/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input 
                    id="phone" 
                    type="tel"
                    placeholder="7xxxxxxx" 
                    className="flex h-12 w-full pr-10 text-right bg-background/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="city">المدينة</Label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input 
                      id="city" 
                      placeholder="عدن، صنعاء..." 
                      className="flex h-12 w-full pr-10 text-right bg-background/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="address">العنوان</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input 
                      id="address" 
                      placeholder="الشارع، الحي..." 
                      className="flex h-12 w-full pr-10 text-right bg-background/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="nationalId">رقم الهوية الوطنية</Label>
                <div className="relative">
                  <IdCard className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input 
                    id="nationalId" 
                    placeholder="أدخل رقم الهوية" 
                    className="flex h-12 w-full pr-10 text-right bg-background/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                    value={formData.nationalId}
                    onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2 text-right">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input 
                    id="email" 
                    type="email" 
                    placeholder="example@mail.com" 
                    className="flex h-12 w-full pr-10 text-right bg-background/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="password">كلمة المرور</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input 
                      id="password" 
                      type="password" 
                      placeholder="••••••••" 
                      className="flex h-12 w-full pr-10 text-right bg-background/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Label htmlFor="confirmPassword">تأكيد</Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input 
                      id="confirmPassword" 
                      type="password" 
                      placeholder="••••••••" 
                      className="flex h-12 w-full pr-10 text-right bg-background/50 border-none rounded-2xl px-4 text-sm focus:ring-2 focus:ring-primary outline-none" 
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      required 
                    />
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full h-14 text-lg font-black rounded-2xl group shadow-xl shadow-primary/20 mt-4" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "تسجيل الحساب"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm font-bold text-muted-foreground">
          لديك حساب بالفعل؟{" "}
          <Link href="/auth/login" className="text-primary font-black hover:underline">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
