
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, X, Loader2, Sparkles, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { voiceActivatedTransaction } from '@/ai/flows/voice-activated-transaction-flow';
import { useToast } from '@/hooks/use-toast';

interface VoiceCommandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceCommandDialog({ open, onOpenChange }: VoiceCommandDialogProps) {
  const [command, setCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleProcessCommand = async () => {
    if (!command.trim()) return;
    
    setIsProcessing(true);
    try {
      const result = await voiceActivatedTransaction({ commandText: command });
      
      if (result.intent === 'goToPage' && result.entities?.page) {
        const page = result.entities.page === 'home' ? 'dashboard' : result.entities.page;
        router.push(`/${page}`);
        onOpenChange(false);
        setCommand('');
      } else if (result.intent === 'sendMoney') {
        const { amount, currency, recipientUid } = result.entities || {};
        const query = new URLSearchParams();
        if (amount) query.append('amount', amount.toString());
        if (currency) query.append('currency', currency);
        if (recipientUid) query.append('recipientUid', recipientUid);
        
        router.push(`/dashboard/send?${query.toString()}`);
        onOpenChange(false);
        setCommand('');
      } else if (result.intent === 'deposit') {
         const { amount, currency } = result.entities || {};
         const query = new URLSearchParams();
         if (amount) query.append('amount', amount.toString());
         if (currency) query.append('currency', currency);
         router.push(`/dashboard/deposit?${query.toString()}`);
         onOpenChange(false);
         setCommand('');
      } else {
        toast({
          title: "I didn't quite catch that",
          description: "Try something like 'Send 50 dollars to user123' or 'Go to history'",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process voice command.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Voice Command
          </DialogTitle>
          <DialogDescription>
            Speak naturally to navigate or initiate transactions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-8">
          <div className={`p-8 rounded-full mb-6 transition-all duration-500 ${isProcessing ? 'bg-primary/20 animate-pulse' : 'bg-primary/10'}`}>
            {isProcessing ? (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            ) : (
              <Mic className="h-12 w-12 text-primary" />
            )}
          </div>
          
          <div className="w-full space-y-4">
            <div className="relative">
              <Input
                placeholder="How can I help you today?"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleProcessCommand()}
                disabled={isProcessing}
                className="pr-10"
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 top-0 h-full hover:bg-transparent"
                onClick={handleProcessCommand}
                disabled={isProcessing}
              >
                <Send className="h-4 w-4 text-primary" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Try: "Send 100 USD to userX" or "Show history"
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
