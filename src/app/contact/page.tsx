"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Phone, Mail, Globe, MapPin, MessageSquare, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AppLogo } from '@/components/layout/AppLogo';

export default function ContactPage() {
  const router = useRouter();
  const db = useFirestore();
  
  // حماية المرجع من القيم الفارغة أثناء البناء
  const configRef = useMemoFirebase(() => db ? doc(db, 'system', 'config') : null, [db]);
  const { data: config } = useDoc(configRef);

  const phone = config?.contactPhone || '775371829';
  const email = config?.contactEmail || 'support@qtbm.com';

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">اتصل بنا</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
      </header>

      <main className="p-6 space-y-6 overflow-y-auto">
        <div className="flex justify-center py-8">
          <AppLogo />
        </div>

        <section className="space-y-4">
          <Card className="rounded-[2.5rem] border-none glass-morphism overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`tel:${phone}`)}>
                <div className="p-4 bg-green-500/10 text-green-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">رقم الهاتف</p>
                  <p className="text-lg font-black tracking-tighter">{phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.open(`mailto:${email}`)}>
                <div className="p-4 bg-primary/10 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">البريد الإلكتروني</p>
                  <p className="text-lg font-black tracking-tight">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer" onClick={() => router.push('/support')}>
                <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground">المحادثة الفورية</p>
                  <p className="text-lg font-black">شكاوى واقتراحات</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border-none glass-morphism p-8 space-y-4 text-center">
             <h3 className="font-black text-sm">تواصل معنا عبر منصاتنا الرسمية</h3>
             <div className="flex justify-center gap-4">
                <Button size="icon" variant="secondary" className="rounded-2xl"><Globe className="h-5 w-5" /></Button>
                <Button size="icon" variant="secondary" className="rounded-2xl"><ExternalLink className="h-5 w-5" /></Button>
             </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
