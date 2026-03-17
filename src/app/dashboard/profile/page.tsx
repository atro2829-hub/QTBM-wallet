
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, 
  User, 
  Phone, 
  MapPin, 
  Building2, 
  IdCard, 
  Save, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const userProfileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc(userProfileRef);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    nationalId: ''
  });

  // State to track if fields are already set (to disable them)
  const [isFieldLocked, setIsFieldLocked] = useState({
    fullName: false,
    phone: false,
    address: false,
    city: false,
    nationalId: false
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        phone: profile.phoneNumber || '',
        address: profile.address || '',
        city: profile.city || '',
        nationalId: profile.nationalIdNumber || ''
      });

      // Lock fields that already have values
      setIsFieldLocked({
        fullName: !!profile.fullName,
        phone: !!profile.phoneNumber,
        address: !!profile.address,
        city: !!profile.city,
        nationalId: !!profile.nationalIdNumber
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        fullName: formData.fullName,
        phoneNumber: formData.phone,
        address: formData.address,
        city: formData.city,
        nationalIdNumber: formData.nationalId,
        updatedAt: serverTimestamp()
      });
      toast({ 
        title: "تم الحفظ بنجاح", 
        description: "تم تحديث بيانات ملفك الشخصي وهي الآن محمية من التعديل." 
      });
      router.push('/settings');
    } catch (error: any) {
      toast({ 
        title: "خطأ في التحديث", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isProfileLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  const allLocked = Object.values(isFieldLocked).every(v => v === true);

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x pb-10" dir="rtl">
      <header className="p-6 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowRight className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-black tracking-tight">معلومات الحساب</h1>
      </header>

      <main className="p-6 space-y-6 overflow-y-auto">
        <div className="flex flex-col items-center py-4 gap-3">
          <div className="relative group">
            <div className="h-24 w-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-xl">
              <User className="h-12 w-12 text-primary" />
            </div>
            {allLocked && (
              <div className="absolute -bottom-1 -right-1 p-2 bg-green-500 rounded-full border-4 border-background shadow-lg">
                <CheckCircle2 className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black">{profile?.fullName || 'مستخدم جديد'}</h2>
            <p className="text-[10px] font-mono font-bold text-muted-foreground opacity-70">UID: {user?.uid}</p>
          </div>
        </div>

        {!allLocked && (
          <Alert variant="default" className="bg-primary/5 border-primary/20 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-xs font-black">تنبيه هام</AlertTitle>
            <AlertDescription className="text-[10px] font-bold">
              بمجرد حفظ بياناتك القانونية، لن تتمكن من تعديلها لاحقاً لضمان أمان العمليات المالية.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-md">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <CardTitle className="text-lg font-black">البيانات القانونية</CardTitle>
              <CardDescription className="text-xs">يجب أن تتطابق البيانات مع الهوية الرسمية</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">الاسم الكامل</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.fullName} 
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="الاسم كما في الهوية" 
                    className="pr-10 h-12 rounded-2xl bg-background/50 disabled:opacity-80 disabled:bg-muted"
                    required
                    disabled={isFieldLocked.fullName}
                  />
                  {isFieldLocked.fullName && <Lock className="absolute left-3 top-4 h-3 w-3 text-muted-foreground/40" />}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.phone} 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="7xxxxxxx" 
                    className="pr-10 h-12 rounded-2xl bg-background/50 disabled:opacity-80 disabled:bg-muted"
                    required
                    disabled={isFieldLocked.phone}
                  />
                  {isFieldLocked.phone && <Lock className="absolute left-3 top-4 h-3 w-3 text-muted-foreground/40" />}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">المدينة</Label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={formData.city} 
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      placeholder="المدينة" 
                      className="pr-10 h-12 rounded-2xl bg-background/50 disabled:opacity-80 disabled:bg-muted"
                      required
                      disabled={isFieldLocked.city}
                    />
                    {isFieldLocked.city && <Lock className="absolute left-3 top-4 h-3 w-3 text-muted-foreground/40" />}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">العنوان</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      value={formData.address} 
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      placeholder="الشارع" 
                      className="pr-10 h-12 rounded-2xl bg-background/50 disabled:opacity-80 disabled:bg-muted"
                      required
                      disabled={isFieldLocked.address}
                    />
                    {isFieldLocked.address && <Lock className="absolute left-3 top-4 h-3 w-3 text-muted-foreground/40" />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">رقم الهوية الوطنية</Label>
                <div className="relative">
                  <IdCard className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    value={formData.nationalId} 
                    onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                    placeholder="رقم الهوية" 
                    className="pr-10 h-12 rounded-2xl bg-background/50 disabled:opacity-80 disabled:bg-muted"
                    required
                    disabled={isFieldLocked.nationalId}
                  />
                  {isFieldLocked.nationalId && <Lock className="absolute left-3 top-4 h-3 w-3 text-muted-foreground/40" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <Button 
            type="submit" 
            className="w-full h-16 rounded-[2rem] font-black text-lg gap-2 shadow-2xl shadow-primary/30 active:scale-95 transition-all"
            disabled={isLoading || allLocked}
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : allLocked ? (
              <>
                <Lock className="h-5 w-5" />
                البيانات محفوظة ومحمية
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                حفظ وتأمين البيانات
              </>
            )}
          </Button>
        </form>
      </main>
    </div>
  );
}
