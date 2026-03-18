
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, IdCard, Camera, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function VerificationPage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    idType: 'National ID',
    idNumber: '',
    fullName: ''
  });

  const WHATSAPP_NUMBER = "967775371829";

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      // تحديث حالة الطلب في قاعدة البيانات
      await updateDoc(doc(db, 'users', user.uid), {
        verificationStatus: 'pending',
        idType: formData.idType,
        idNumber: formData.idNumber,
        fullNameAtVerification: formData.fullName,
        verificationSubmittedAt: serverTimestamp()
      });

      // إنشاء رسالة الواتساب
      const message = `*طلب تحقق من الهوية - QTBM Wallet*%0A%0A` +
        `👤 الاسم: ${formData.fullName}%0A` +
        `🆔 نوع الوثيقة: ${formData.idType}%0A` +
        `🔢 رقم الوثيقة: ${formData.idNumber}%0A` +
        `🔑 معرف المستخدم (UID): ${user.uid}%0A%0A` +
        `⚠️ يرجى إرفاق صور الوثيقة (وجه وظفر) هنا لمطابقة البيانات.`;

      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
      
      toast({ title: "تم تقديم الطلب", description: "سيتم توجيهك الآن للواتساب لإرفاق صور الوثائق." });
      
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        router.push('/dashboard');
      }, 2000);

    } catch (error: any) {
      toast({ title: "خطأ", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">توثيق الحساب</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="p-6 space-y-6 overflow-y-auto pb-20">
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="p-5 bg-primary/10 text-primary rounded-[2.5rem] shadow-2xl">
            <ShieldCheck className="h-12 w-12" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-black">تحقق من هويتك</h2>
            <p className="text-xs text-muted-foreground font-bold px-6">لضمان أمان أموالك، نطلب منك توثيق حسابك بالوثائق الرسمية.</p>
          </div>
        </div>

        <Card className="rounded-[2.5rem] border-none shadow-xl glass-morphism overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <IdCard className="h-5 w-5 text-primary" />
              بيانات الوثيقة
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">الاسم الكامل (كما في الوثيقة)</Label>
                <Input 
                  placeholder="أدخل اسمك الكامل" 
                  className="h-14 rounded-2xl bg-background/50"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">نوع الوثيقة</Label>
                  <Select value={formData.idType} onValueChange={(v) => setFormData({...formData, idType: v})}>
                    <SelectTrigger className="h-14 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="National ID">هوية وطنية</SelectItem>
                      <SelectItem value="Passport">جواز سفر</SelectItem>
                      <SelectItem value="Driver License">رخصة قيادة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 text-right">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">رقم الوثيقة</Label>
                  <Input 
                    placeholder="000-000-000" 
                    className="h-14 rounded-2xl bg-background/50"
                    value={formData.idNumber}
                    onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="p-4 bg-orange-500/5 rounded-2xl flex gap-3 border border-orange-500/10">
                <AlertCircle className="h-5 w-5 text-orange-600 shrink-0" />
                <p className="text-[10px] font-bold text-orange-700 leading-relaxed">
                  بعد حفظ البيانات، سيتم توجيهك للواتساب لإرسال صور الوثيقة. يرجى التأكد من وضوح الصور.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-[2rem] font-black text-lg gap-2 shadow-2xl shadow-primary/20 active:scale-95" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <Send className="h-6 w-6" />}
                حفظ وإرسال للواتساب
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
