"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UserPlus, Search, Users, MoreVertical, MessageSquare, Send, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { BottomNav } from '@/components/layout/BottomNav';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const MOCK_FRIENDS = [
  { id: '1', name: 'Ahmed Al-Wasabi', uid: 'WASH-9912', status: 'Online', avatar: '1' },
  { id: '2', name: 'Sarah Ahmed', uid: 'SARAH-4562', status: 'Offline', avatar: '2' },
  { id: '3', name: 'Mohammed Ali', uid: 'MOH-7781', status: 'Online', avatar: '3' },
];

export default function FriendsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  return (
    <div className="min-h-screen mesh-background flex flex-col max-w-md mx-auto relative border-x pb-24 shadow-2xl">
      <header className="p-6 pb-2 flex flex-col gap-4 sticky top-0 bg-background/50 backdrop-blur-md z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="rounded-full">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-black tracking-tight">Friends</h1>
          </div>
          <Button size="icon" className="rounded-full shadow-lg" onClick={() => setIsAdding(true)}>
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative group">
          <Search className="absolute left-4 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name or UID..." 
            className="pl-12 h-11 bg-card/50 glass-morphism border-none rounded-2xl" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <main className="p-6 flex-1 overflow-y-auto space-y-6">
        <div className="space-y-4">
          {MOCK_FRIENDS.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.uid.includes(search)).map((friend) => (
            <Card key={friend.id} className="glass-morphism rounded-3xl border-none shadow-sm hover:shadow-md transition-all active:scale-[0.98] group overflow-hidden">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                      <AvatarImage src={`https://picsum.photos/seed/friend${friend.avatar}/100/100`} />
                      <AvatarFallback>{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background ${friend.status === 'Online' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm tracking-tight">{friend.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[9px] h-4 font-black uppercase py-0 px-1.5 opacity-70">UID: {friend.uid}</Badge>
                      <span className="text-[10px] font-bold text-muted-foreground">{friend.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="rounded-xl hover:bg-primary/10 text-primary" onClick={() => router.push(`/dashboard/send?recipientUid=${friend.uid}`)}>
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="rounded-xl">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {MOCK_FRIENDS.length === 0 && (
            <div className="py-20 text-center space-y-4 opacity-50">
               <Users className="h-16 w-16 mx-auto text-primary/30" />
               <div className="space-y-1">
                 <p className="font-black">No friends yet</p>
                 <p className="text-xs font-bold text-muted-foreground">Add friends by their UID to send money faster.</p>
               </div>
               <Button variant="secondary" className="rounded-xl font-bold" onClick={() => setIsAdding(true)}>Add your first friend</Button>
            </div>
          )}
        </div>

        <section className="space-y-4">
           <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
             <ShieldCheck className="h-5 w-5 text-primary" />
             Trusted Accounts
           </h3>
           <div className="p-6 rounded-[2.5rem] glass-morphism bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                Accounts marked with a blue check have verified their National ID and are safe for large peer-to-peer transfers.
              </p>
           </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}