
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Search, Info, Loader2, ShieldCheck, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, serverTimestamp, getDoc, increment } from 'firebase/firestore';
import { updateDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';

function SendMoneyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    recipientUid: '',
  });

  const walletRef = useMemoFirebase(() => user && db ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  useEffect(() => {
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const recipientUid = searchParams.get('recipientUid');

    if (amount) setFormData(prev => ({ ...prev, amount }));
    if (currency) setFormData(prev => ({ ...prev, currency }));
    if (recipientUid) {
      setFormData(prev => ({ ...prev, recipientUid }));
      if (db) verifyRecipient(recipientUid, db);
    }
  }, [searchParams, db]);

  const verifyRecipient = async (uid: string, firestoreDb: any) => {
    if (!uid || uid.length < 5) {
      setRecipientName(null);
      return;
    }
    setIsSearching(true);
    try {
      const userDoc = await getDoc(doc(firestoreDb, 'users', uid));
      if (userDoc.exists()) {
        setRecipientName(userDoc.data().fullName);
      } else {
        setRecipientName(null);
      }
    } catch (e) {
      setRecipientName(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, recipientUid: val });
    if (val.length >= 10 && db) {
      verifyRecipient(val, db);
    } else {
      setRecipientName(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !wallet || !recipientName || !db) {
      if (!recipientName) toast({ title: "يرجى التأكد من هوية المستلم أولاً", variant: "destructive" });
      return;
    }

    const amount = parseFloat(formData.amount);
    const currencyField = `${formData.currency.toLowerCase()}Balance`;
    const currentBalance = (wallet[currencyField as keyof typeof wallet] as number) || 0;
    
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "مبلغ غير صالح", variant: "destructive" });
      return;
    }

    if (currentBalance < amount) {
      toast({ 
        title: "رصيد غير كافٍ", 
        description: `رصيدك الحالي في ${formData.currency} هو ${currentBalance}.`, 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      const senderWalletRef = doc(db, 'users', user.uid, 'wallet', 'wallet');
      updateDocumentNonBlocking(senderWalletRef, {
        [currencyField]: increment(-amount),
        updatedAt: serverTimestamp()
      });

      const receiverWalletRef = doc(db, 'users', formData.recipientUid, 'wallet', 'wallet');
      updateDocumentNonBlocking(receiverWalletRef, {
        [currencyField]: increment(amount),
        updatedAt: serverTimestamp()
      });

      addDocumentNonBlocking(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'send',
        amount: amount,
        currency: formData.currency,
        description: `حوالة صادر إلى ${recipientName}`,
        recipientUid: formData.recipientUid,
        recipientName: recipientName,
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      addDocumentNonBlocking(collection(db, 'users', formData.recipientUid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'receive',
        amount: amount,
        currency: formData.currency,
        description: `حوالة وارد من ${wallet.fullName || user.displayName || 'مستخدم'}`,
        senderUid: user.uid,
        senderName: wallet.fullName || user.displayName || 'مستخدم',
        status: 'Completed',
        createdAt: serverTimestamp(),
      });

      toast({ title: "تم التحويل فوراً", description: "تمت إضافة المبلغ إلى محفظة المستلم بنجاح." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "خطأ في التحويل", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x" dir="rtl">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-background/50 backdrop-blur-md z-10 border-b">
        <h1 className="text-xl font-black">إرسال فوري وآمن</h1>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-6 w-6 rotate-180" />
        </Button>
      </header>

      <main className="p-6 space-y-6 flex-1 overflow-y-auto">
        <Card className="rounded-[2.5rem] border-none shadow-xl glass-morphism overflow-hidden">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
               <ShieldCheck className="h-5 w-5 text-primary" />
               تأكيد هوية المستلم
            </CardTitle>
            <CardDescription className="font-bold">الحوالات فورية ولا يمكن التراجع عنها.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2 text-right">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">معرف المستلم (UID)</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-3.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="أدخل الـ UID للمستلم" 
                    className="pr-10 h-14 rounded-2xl bg-background/50"
                    value={formData.recipientUid}
                    onChange={handleUidChange}
                    required 
                  />
                  {isSearching && <Loader2 className="absolute left-3 top-4 h-4 w-4 animate-spin text-primary" />}
                </div>

                {recipientName ? (
                  <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 animate-in zoom-in-95 duration-300">
                    <UserCheck className="h-5 w-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-[10px] font-black text-green-600 uppercase">مستلم مؤكد:</p>
                      <p className="text-sm font-black">{recipientName}</p>
                    </div>
                  </div>
                ) : formData.recipientUid.length >= 10 && !isSearching ? (
                  <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-xs font-bold">لم يتم العثور على مستلم بهذا المعرف.</p>
                  </div>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-right">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">المبلغ</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-14 rounded-2xl bg-background/50 text-lg font-black"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2 text-right">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">العملة</Label>
                  <Select value={formData.currency} onValueChange={(val) => setFormData({...formData, currency: val})}>
                    <SelectTrigger className="h-14 rounded-2xl bg-background/50 font-bold"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD (دولار)</SelectItem>
                      <SelectItem value="YER">YER (يمني)</SelectItem>
                      <SelectItem value="SAR">SAR (سعودي)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl flex gap-3 border border-primary/10">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed">
                  هذه المعاملة ستنفذ **فوراً**. سيتم خصم المبلغ من رصيدك وإضافته لحساب المستلم في نفس اللحظة.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-[2rem] font-black text-lg gap-2 shadow-2xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50" 
                disabled={isLoading || !recipientName}
              >
                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <Send className="h-6 w-6" />}
                {isLoading ? "جاري التحويل..." : "إرسال فوراً"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function SendMoneyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>}>
      <SendMoneyContent />
    </Suspense>
  );
}
