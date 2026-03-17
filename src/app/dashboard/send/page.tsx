
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Search, Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function SendMoneyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    recipientUid: '',
  });

  const walletRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid, 'wallet', 'wallet') : null, [db, user]);
  const { data: wallet } = useDoc(walletRef);

  useEffect(() => {
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const recipientUid = searchParams.get('recipientUid');

    if (amount) setFormData(prev => ({ ...prev, amount }));
    if (currency) setFormData(prev => ({ ...prev, currency }));
    if (recipientUid) setFormData(prev => ({ ...prev, recipientUid }));
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !wallet) return;

    const amount = parseFloat(formData.amount);
    const currencyKey = `${formData.currency.toLowerCase()}Balance` as keyof typeof wallet;
    const currentBalance = (wallet[currencyKey] as number) || 0;
    
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", variant: "destructive" });
      return;
    }

    if (currentBalance < amount) {
      toast({ 
        title: "Insufficient Balance", 
        description: `You don't have enough ${formData.currency} to complete this transfer.`, 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    try {
      // Record in user's transactions as Pending
      await addDoc(collection(db, 'users', user.uid, 'transactions'), {
        initiatorUserId: user.uid,
        type: 'send',
        amount: amount,
        currency: formData.currency,
        description: `Transfer to ${formData.recipientUid}`,
        status: 'Pending',
        recipientUserId: [formData.recipientUid],
        createdAt: serverTimestamp(),
      });

      toast({ title: "Transfer Initiated", description: "Your transfer is pending administrator approval for security." });
      router.push('/dashboard');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Send Money</h1>
      </header>

      <main className="p-6 flex-1 overflow-y-auto">
        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Recipient Details</CardTitle>
            <CardDescription>Enter the details for your secure transfer.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient UID</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="recipient" 
                    placeholder="e.g. USER-12345" 
                    className="pl-10"
                    value={formData.recipientUid}
                    onChange={(e) => setFormData({...formData, recipientUid: e.target.value})}
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(val) => setFormData({...formData, currency: val})}
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="YER">YER</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All user-to-user transfers are held as <span className="text-primary font-bold">pending</span> until verified by our support team for your safety.
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-md font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : "Send Now"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
