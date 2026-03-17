"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Wallet, Copy, Info, CheckCircle2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWalletStore, Currency } from '@/app/lib/store';
import { useToast } from '@/hooks/use-toast';

const DEPOSIT_INFO = {
  USD: [
    { label: 'TRC20 Wallet', value: 'TF3kH28vsP7we5LKk7VoUjh1jZfyXXWCQr' },
    { label: 'Binance ID', value: '582733976' },
    { label: 'بنك الكريمي (USD)', value: '3104105757' }
  ],
  YER: [
    { label: 'بنك القطيبي (YER)', value: '462175547' },
    { label: 'بنك الكريمي (YER)', value: '3108878826' }
  ],
  SAR: [
    { label: 'بنك القطيبي (SAR)', value: '462175547' },
    { label: 'بنك الكريمي (SAR)', value: '3111513839' }
  ],
};

export default function DepositPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addTransaction } = useWalletStore();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD' as Currency,
    txHash: '',
  });

  useEffect(() => {
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');
    if (amount || currency) {
      setFormData(prev => ({
        ...prev,
        amount: amount || '',
        currency: (currency as Currency) || 'USD',
      }));
    }
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return;

    addTransaction({
      id: Math.random().toString(36).substr(2, 9),
      type: 'deposit',
      description: `Deposit via ${formData.currency}`,
      amount: amount,
      currency: formData.currency,
      status: 'Pending',
      date: new Date().toISOString(),
    });

    toast({ title: "Deposit Request Submitted", description: "Our team will verify the transaction and update your balance soon." });
    router.push('/dashboard');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "Address copied to clipboard." });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto relative border-x pb-20">
      <header className="p-4 flex items-center gap-4 sticky top-0 bg-background/80 backdrop-blur-md z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Deposit Funds / إيداع</h1>
      </header>

      <main className="p-6 flex-1 overflow-y-auto space-y-6">
        <Card className="shadow-lg border-none bg-primary text-white overflow-hidden relative">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Deposit Instructions
            </CardTitle>
            <CardDescription className="text-white/70">Please send funds to the accounts below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/80">Selected Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(val) => setFormData({...formData, currency: val as Currency})}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD (TRC20 / Bank)</SelectItem>
                  <SelectItem value="YER">Yemeni Rial (Bank)</SelectItem>
                  <SelectItem value="SAR">Saudi Rial (Bank)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              {DEPOSIT_INFO[formData.currency].map((info, idx) => (
                <div key={idx} className="bg-white/10 rounded-xl p-4 space-y-2 border border-white/20">
                  <p className="text-[10px] uppercase font-bold text-white/60 tracking-wider">{info.label}</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs break-all leading-tight font-mono">{info.value}</code>
                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard(info.value)} className="shrink-0 text-white hover:bg-white/20">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        </Card>

        <Card className="shadow-lg border-none">
          <CardHeader>
            <CardTitle className="text-lg">Transaction Details</CardTitle>
            <CardDescription>Enter the amount and proof of transfer.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount Sent</Label>
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
                <Label htmlFor="txHash">Transaction ID / Notice Number</Label>
                <Input 
                  id="txHash" 
                  placeholder="Paste transaction ID or notice number" 
                  value={formData.txHash}
                  onChange={(e) => setFormData({...formData, txHash: e.target.value})}
                  required 
                />
              </div>

              <div className="p-4 bg-accent/50 rounded-xl flex gap-3">
                <Info className="h-5 w-5 text-primary shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your deposit will be credited once confirmed by our staff. Typical processing time is 5-15 minutes.
                </p>
              </div>

              <Button type="submit" className="w-full h-12 text-md font-bold">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
