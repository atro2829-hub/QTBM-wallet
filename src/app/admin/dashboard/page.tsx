
"use client";

import React, { useState } from 'react';
import { 
  ArrowDownLeft, 
  LayoutDashboard, 
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
  Coins,
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
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('approvals');
  
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const offersQuery = useMemoFirebase(() => collection(db, 'offers'), [db]);
  const { data: offers, isLoading: offersLoading } = useCollection(offersQuery);

  const pendingRequestsQuery = useMemoFirebase(() => 
    query(collection(db, 'depositRequests'), where('status', '==', 'pending')), 
  [db]);
  const { data: pendingRequests, isLoading: requestsLoading } = useCollection(pendingRequestsQuery);

  const [newProduct, setNewProduct] = useState({ name: '', price: '', currency: 'USD', description: '', iconName: 'ShoppingCart' });
  const [newOffer, setNewOffer] = useState({ name: '', description: '', discountPercentage: '', fixedDiscountAmount: '', currency: 'USD' });

  const handleApprove = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'depositRequests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        processedAt: serverTimestamp()
      });
      toast({ title: "Approved", description: "Request verified and approved." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const requestRef = doc(db, 'depositRequests', requestId);
      await updateDoc(requestRef, {
        status: 'rejected',
        processedAt: serverTimestamp()
      });
      toast({ title: "Rejected", description: "Request has been declined." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        isActive: true,
        iconUrl: 'https://picsum.photos/seed/product/100/100',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewProduct({ name: '', price: '', currency: 'USD', description: '', iconName: 'ShoppingCart' });
      toast({ title: "Success", description: "Product added to live catalog." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAddOffer = async () => {
    if (!newOffer.name || (!newOffer.discountPercentage && !newOffer.fixedDiscountAmount)) return;
    try {
      await addDoc(collection(db, 'offers'), {
        name: newOffer.name,
        description: newOffer.description,
        discountPercentage: newOffer.discountPercentage ? [parseFloat(newOffer.discountPercentage)] : [],
        fixedDiscountAmount: newOffer.fixedDiscountAmount ? [parseFloat(newOffer.fixedDiscountAmount)] : [],
        currency: [newOffer.currency],
        isActive: true,
        startDate: serverTimestamp(),
        endDate: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewOffer({ name: '', description: '', discountPercentage: '', fixedDiscountAmount: '', currency: 'USD' });
      toast({ title: "Success", description: "Promotional offer launched." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full" dir="ltr">
        <Sidebar variant="sidebar" className="border-r shadow-xl">
          <SidebarHeader className="p-8">
            <h1 className="text-2xl font-black text-primary flex items-center gap-3 tracking-tighter">
              <div className="p-2 bg-primary rounded-xl text-white shadow-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
              QTBM Core
            </h1>
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
                  <span>Catalog & Multi-Currency</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'offers'} onClick={() => setActiveTab('offers')} className="h-12 rounded-xl font-bold">
                  <Tag className="h-5 w-5" />
                  <span>Campaigns</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <Separator className="my-4 opacity-50" />
              <SidebarMenuItem>
                <SidebarMenuButton className="h-12 rounded-xl font-bold opacity-60">
                  <Users className="h-5 w-5" />
                  <span>User Roles</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-12 rounded-xl font-bold opacity-60">
                  <Settings className="h-5 w-5" />
                  <span>System Config</span>
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
              <div className="flex flex-col">
                <h2 className="text-lg font-black tracking-tight uppercase">Management Panel</h2>
                <span className="text-[10px] font-bold text-muted-foreground tracking-[0.2em]">Live Financial Network</span>
              </div>
            </div>
            <div className="flex gap-2">
               <Badge variant="outline" className="h-8 font-black uppercase text-xs px-4 border-primary/20 text-primary">System Online</Badge>
            </div>
          </header>

          <main className="p-8 space-y-8 max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="approvals" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-card/50 backdrop-blur-md">
                  <CardHeader className="bg-primary/5 border-b border-primary/10 p-8">
                    <CardTitle className="text-2xl font-black">Financial Verifications</CardTitle>
                    <CardDescription className="font-bold text-muted-foreground/70">Review and verify user deposit requests across all networks.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {requestsLoading ? (
                      <div className="p-20 flex flex-col items-center gap-4">
                         <Loader2 className="animate-spin h-10 w-10 text-primary" />
                         <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Syncing Ledger...</span>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted text-muted-foreground font-black uppercase tracking-widest text-[10px]">
                              <th className="px-8 py-5 text-left">Requester UID</th>
                              <th className="px-8 py-5 text-left">Transaction Details</th>
                              <th className="px-8 py-5 text-left">Volume</th>
                              <th className="px-8 py-5 text-right">Settlement</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {pendingRequests?.map((req) => (
                              <tr key={req.id} className="hover:bg-accent/30 transition-colors">
                                <td className="px-8 py-6">
                                  <div className="flex flex-col">
                                    <span className="font-bold text-xs truncate max-w-[120px]">{req.userId}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono">ID: {req.id.slice(0, 8)}</span>
                                  </div>
                                </td>
                                <td className="px-8 py-6 font-black text-xs uppercase tracking-tight">{req.externalTransactionDetails}</td>
                                <td className="px-8 py-6">
                                  <div className="flex items-center gap-2">
                                     <span className="text-lg font-black tracking-tight">{req.amount}</span>
                                     <Badge className="font-black text-[10px] h-5 bg-primary/10 text-primary border-none">{req.currency}</Badge>
                                  </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                  <div className="flex justify-end gap-3">
                                    <Button size="icon" className="h-10 w-10 rounded-xl bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20" onClick={() => handleApprove(req.id)}>
                                      <CheckCircle2 className="h-5 w-5 text-white" />
                                    </Button>
                                    <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl shadow-lg shadow-destructive/20" onClick={() => handleReject(req.id)}>
                                      <XCircle className="h-5 w-5 text-white" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {(!pendingRequests || pendingRequests.length === 0) && (
                              <tr><td colSpan={4} className="p-20 text-center text-muted-foreground font-bold italic opacity-40">Clean Slate: No pending verifications found.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <h3 className="text-3xl font-black tracking-tighter">Global Inventory</h3>
                    <p className="text-sm font-bold text-muted-foreground">Configure digital assets and multi-currency pricing.</p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20"><Plus className="h-5 w-5" /> New Product</Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] p-8">
                      <DialogHeader><DialogTitle className="text-2xl font-black">Asset Configuration</DialogTitle></DialogHeader>
                      <div className="space-y-5 py-6">
                        <div className="space-y-2">
                          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Product Label</Label>
                          <Input value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Netflix Premium" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Asset Currency</Label>
                          <Select value={newProduct.currency} onValueChange={(val) => setNewProduct({...newProduct, currency: val})}>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="USD">USD - Dollar</SelectItem>
                              <SelectItem value="YER">YER - Yemeni Rial</SelectItem>
                              <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Market Price</Label>
                          <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                           <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Icon Identifier</Label>
                           <Input value={newProduct.iconName} onChange={(e) => setNewProduct({...newProduct, iconName: e.target.value})} placeholder="Tv, Gamepad2, Coins..." className="h-12 rounded-xl" />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button className="w-full h-12 rounded-xl font-black" onClick={handleAddProduct}>Commit to Market</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {productsLoading ? (
                   <div className="p-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map((p) => (
                      <Card key={p.id} className="rounded-[2.5rem] border-none shadow-lg hover:shadow-2xl transition-all group overflow-hidden bg-card/50 backdrop-blur-sm">
                        <CardContent className="p-8 flex justify-between items-center relative">
                          <div className="absolute -left-4 -bottom-4 h-20 w-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors" />
                          <div className="space-y-3 z-10">
                            <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest opacity-60 border-primary/20">Active Entity</Badge>
                            <div>
                               <h4 className="text-lg font-black tracking-tight">{p.name}</h4>
                               <p className="text-xs font-bold text-muted-foreground mt-1 uppercase">{p.id.slice(0, 12)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className="text-2xl font-black text-primary tracking-tighter">{p.price}</span>
                               <span className="text-xs font-bold text-muted-foreground uppercase">{p.currency}</span>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl hover:bg-destructive/10 text-destructive transition-colors z-10" onClick={() => deleteDoc(doc(db, 'products', p.id))}>
                            <Trash2 className="h-6 w-6" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="offers" className="space-y-8">
                 <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <h3 className="text-3xl font-black tracking-tighter">Campaign Engine</h3>
                      <p className="text-sm font-bold text-muted-foreground">Boost user engagement with rewards and tactical discounts.</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20 bg-purple-600 hover:bg-purple-700"><Plus className="h-5 w-5" /> Launch Campaign</Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-[2.5rem] p-8">
                        <DialogHeader><DialogTitle className="text-2xl font-black">Strategic Promotion</DialogTitle></DialogHeader>
                        <div className="space-y-5 py-6">
                          <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Campaign Name</Label>
                            <Input value={newOffer.name} onChange={(e) => setNewOffer({...newOffer, name: e.target.value})} placeholder="e.g. Lunar New Year" className="h-12 rounded-xl" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground text-purple-600">Discount %</Label>
                              <div className="relative">
                                <Percent className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10 h-12 rounded-xl" type="number" value={newOffer.discountPercentage} onChange={(e) => setNewOffer({...newOffer, discountPercentage: e.target.value})} placeholder="15" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground text-green-600">Fixed USD Off</Label>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                                <Input className="pl-10 h-12 rounded-xl" type="number" value={newOffer.fixedDiscountAmount} onChange={(e) => setNewOffer({...newOffer, fixedDiscountAmount: e.target.value})} placeholder="10.00" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="w-full h-12 rounded-xl font-black bg-purple-600" onClick={handleAddOffer}>Activate Live Campaign</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {offersLoading ? (
                    <div className="p-20 flex justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {offers?.map((offer) => (
                        <Card key={offer.id} className="rounded-[2.5rem] border-none shadow-lg overflow-hidden relative group bg-card/50 backdrop-blur-sm">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-primary/10 opacity-50" />
                          <CardHeader className="relative z-10 pb-2">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <CardTitle className="text-xl font-black tracking-tight">{offer.name}</CardTitle>
                                  <Badge className="bg-green-500 font-black text-[9px] uppercase tracking-widest px-2 h-5 text-white">Live</Badge>
                                </div>
                                <CardDescription className="font-bold text-xs">{offer.description}</CardDescription>
                              </div>
                              <div className="shrink-0">
                                {offer.discountPercentage?.length > 0 && (
                                  <div className="bg-purple-600 text-white p-4 rounded-2xl font-black text-xl shadow-xl shadow-purple-600/30">
                                    -{offer.discountPercentage[0]}%
                                  </div>
                                )}
                                {offer.fixedDiscountAmount?.length > 0 && (
                                  <div className="bg-primary text-white p-4 rounded-2xl font-black text-xl shadow-xl shadow-primary/30">
                                    -{offer.fixedDiscountAmount[0]} {offer.currency?.[0] || 'USD'}
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="relative z-10 flex justify-between items-center mt-4">
                             <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">CAMPAIGN-ID: {offer.id.slice(0, 10)}</span>
                             <Button variant="ghost" size="sm" className="font-black text-destructive/80 hover:bg-destructive/10 rounded-xl" onClick={() => deleteDoc(doc(db, 'offers', offer.id))}>
                               End Campaign
                             </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
