
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Send, Search, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWalletStore, Currency } from '@/app/lib/store';
import { useToast } from '@/hooks/use-toast';

export default function SendMoneyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, addTransaction, updateBalance } = useWalletStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD' as Currency,
    recipientUid: '',
  });

  useEffect(() => {
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    const recipientUid = searchParams.get('recipientUid');

    if (amount || currency || recipientUid) {
      setFormData({
        amount: amount || '',
        currency: (currency as Currency) || 'USD',
        recipientUid: recipientUid || '',
      });
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    
    if (isNaN(amount) || amount <= 0) return;
    if (user && user.balances[formData.currency] < amount) {
      toast({ title: "Insufficient Balance", description: `You don't have enough ${formData.currency} to complete this transfer.`, variant: "destructive" });
      return;
    }

    addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      type: 'send',
      description: `Transfer to ${formData.recipientUid}`,
      amount: amount,
      currency: formData.currency,
      status: 'Pending',
      date: new Date().toISOString(),
      recipientUid: formData.recipientUid,
    });

    updateBalance(formData.currency, -amount);

    toast({ title: "Transfer Initiated", description: "Your transfer is pending administrator approval." });
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x">
      <header className="p-4 flex items-center gap-4">
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
                    onValueChange={(val) => setFormData({...formData, currency: val as Currency})}
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

              <Button type="submit" className="w-full h-12 text-md font-bold">
                Send Now
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
