
"use client";

import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  Package, 
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Loader2,
  DollarSign,
  Percent,
  TrendingUp,
  Settings,
  Users,
  MessageSquare,
  Phone,
  Mail,
  ShieldCheck,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where, orderBy, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLogo } from '@/components/layout/AppLogo';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('approvals');
  
  // System Config
  const configRef = useMemoFirebase(() => doc(db, 'system', 'config'), [db]);
  const { data: config } = useDoc(configRef);
  const [editingConfig, setEditingConfig] = useState({ phone: '', email: '' });

  // Data fetching
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const pendingRequestsQuery = useMemoFirebase(() => 
    query(collection(db, 'depositRequests'), where('status', '==', 'pending')), 
  [db]);
  const { data: pendingRequests, isLoading: requestsLoading } = useCollection(pendingRequestsQuery);

  const chatsQuery = useMemoFirebase(() => collection(db, 'support_chats'), [db]);
  const { data: chats, isLoading: chatsLoading } = useCollection(chatsQuery);

  const [newProduct, setNewProduct] = useState({ name: '', price: '', currency: 'USD', description: '', iconName: 'ShoppingCart' });

  const handleUpdateConfig = async () => {
    try {
      await setDoc(doc(db, 'system', 'config'), {
        contactPhone: editingConfig.phone || config?.contactPhone || '775371829',
        contactEmail: editingConfig.email || config?.contactEmail || 'support@qtbm.com',
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast({ title: "Updated", description: "System configuration saved." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'depositRequests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        processedAt: serverTimestamp()
      });
      toast({ title: "Approved", description: "Request verified." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full" dir="ltr">
        <Sidebar variant="sidebar" className="border-r shadow-xl">
          <SidebarHeader className="p-8">
            <AppLogo />
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} className="h-12 rounded-xl font-bold">
                  <ArrowDownLeft className="h-5 w-5" />
                  <span>Approvals</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} className="h-12 rounded-xl font-bold">
                  <Package className="h-5 w-5" />
                  <span>Catalog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} className="h-12 rounded-xl font-bold">
                  <MessageSquare className="h-5 w-5" />
                  <span>Complaints</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'system'} onClick={() => setActiveTab('system')} className="h-12 rounded-xl font-bold">
                  <Settings className="h-5 w-5" />
                  <span>System Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 bg-muted/30 overflow-y-auto">
          <header className="h-20 border-b px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-6" />
              <h2 className="text-lg font-black tracking-tight uppercase">Admin Control</h2>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary">Live Core</Badge>
          </header>

          <main className="p-8 space-y-8 max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="approvals" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-md">
                  <CardHeader className="bg-primary/5 p-8">
                    <CardTitle className="text-2xl font-black">Financial Verifications</CardTitle>
                    <CardDescription>Review and verify user deposit requests.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted text-[10px] uppercase font-black tracking-widest">
                          <tr>
                            <th className="px-8 py-4 text-left">Requester</th>
                            <th className="px-8 py-4 text-left">Tx Details</th>
                            <th className="px-8 py-4 text-left">Volume</th>
                            <th className="px-8 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {pendingRequests?.map((req) => (
                            <tr key={req.id} className="hover:bg-accent/30 transition-colors text-xs">
                              <td className="px-8 py-6 font-bold">{req.userId}</td>
                              <td className="px-8 py-6 font-mono">{req.externalTransactionDetails}</td>
                              <td className="px-8 py-6">
                                <span className="font-black text-lg">{req.amount}</span> {req.currency}
                              </td>
                              <td className="px-8 py-6 text-right">
                                <Button size="sm" className="rounded-xl bg-green-500 hover:bg-green-600" onClick={() => handleApprove(req.id)}>Approve</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden">
                  <CardHeader className="bg-primary/5 p-8">
                    <CardTitle className="text-2xl font-black">System Configuration</CardTitle>
                    <CardDescription>Manage public contact details and platform settings.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold">Contact Phone</Label>
                        <Input 
                          placeholder={config?.contactPhone || "775371829"} 
                          onChange={(e) => setEditingConfig({...editingConfig, phone: e.target.value})}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">Contact Email</Label>
                        <Input 
                          placeholder={config?.contactEmail || "support@qtbm.com"} 
                          onChange={(e) => setEditingConfig({...editingConfig, email: e.target.value})}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl font-black" onClick={handleUpdateConfig}>
                      Save Configuration
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="support" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl">
                  <CardHeader className="bg-primary/5 p-8">
                    <CardTitle className="text-2xl font-black">User Complaints</CardTitle>
                    <CardDescription>Monitor and respond to support messages.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8">
                    {chatsLoading ? <Loader2 className="animate-spin" /> : (
                      <div className="space-y-4">
                        {chats?.map((chat) => (
                          <div key={chat.id} className="p-4 rounded-2xl border flex justify-between items-center hover:bg-accent/20 cursor-pointer">
                            <div>
                              <p className="font-black text-sm">Chat ID: {chat.id}</p>
                              <p className="text-xs text-muted-foreground">User: {chat.userId}</p>
                            </div>
                            <Button variant="outline" className="rounded-xl">Open Chat</Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
