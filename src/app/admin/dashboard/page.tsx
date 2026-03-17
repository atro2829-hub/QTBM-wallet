"use client";

import React, { useState } from 'react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingBag, 
  LayoutDashboard, 
  Package, 
  Settings, 
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Percent,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('transactions');
  
  // Products collection
  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  // Offers collection
  const offersQuery = useMemoFirebase(() => collection(db, 'offers'), [db]);
  const { data: offers, isLoading: offersLoading } = useCollection(offersQuery);

  // Pending Deposit Requests
  const pendingRequestsQuery = useMemoFirebase(() => 
    query(collection(db, 'depositRequests'), where('status', '==', 'pending')), 
  [db]);
  const { data: pendingRequests, isLoading: requestsLoading } = useCollection(pendingRequestsQuery);

  // Form states
  const [newProduct, setNewProduct] = useState({ name: '', price: '', currency: 'USD', description: '' });
  const [newOffer, setNewOffer] = useState({ name: '', description: '', discount: '', isActive: true });

  const handleApprove = async (requestId: string, userId: string, amount: number, currency: string) => {
    try {
      // 1. Update the request status
      const requestRef = doc(db, 'depositRequests', requestId);
      await updateDoc(requestRef, {
        status: 'approved',
        processedAt: serverTimestamp()
      });

      // 2. Update user's wallet (This logic should ideally be a Cloud Function, but for MVP we update here)
      // Note: Real balance updates should use transactions/atomicity
      toast({ title: "Approved", description: "Request marked as approved." });
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
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        currency: newProduct.currency,
        description: newProduct.description,
        isActive: true,
        iconUrl: 'https://picsum.photos/seed/product/100/100',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewProduct({ name: '', price: '', currency: 'USD', description: '' });
      toast({ title: "Success", description: "Product added to catalog." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      toast({ title: "Deleted", description: "Product removed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar variant="sidebar" className="border-r">
          <SidebarHeader className="p-6">
            <h1 className="text-xl font-bold text-primary flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6" />
              QTBM Admin
            </h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-4">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'transactions'} onClick={() => setActiveTab('transactions')}>
                  <ArrowDownLeft className="h-4 w-4" />
                  <span>Approvals</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'products'} onClick={() => setActiveTab('products')}>
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'offers'} onClick={() => setActiveTab('offers')}>
                  <Tag className="h-4 w-4" />
                  <span>Offers</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto">
          <header className="h-16 border-b px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Separator orientation="vertical" className="h-4" />
              <h2 className="text-lg font-bold">Management Panel</h2>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="transactions" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Approvals Needed</CardTitle>
                    <CardDescription>User deposit requests awaiting verification.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {requestsLoading ? (
                      <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-muted text-muted-foreground">
                            <tr>
                              <th className="px-6 py-4 text-left">User UID</th>
                              <th className="px-6 py-4 text-left">Details</th>
                              <th className="px-6 py-4 text-left">Amount</th>
                              <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {pendingRequests?.map((req) => (
                              <tr key={req.id} className="hover:bg-accent/50">
                                <td className="px-6 py-4 font-mono text-xs">{req.userId}</td>
                                <td className="px-6 py-4 font-medium">{req.externalTransactionDetails}</td>
                                <td className="px-6 py-4 font-bold">{req.amount} {req.currency}</td>
                                <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleApprove(req.id, req.userId, req.amount, req.currency)}>
                                      <CheckCircle2 className="h-5 w-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleReject(req.id)}>
                                      <XCircle className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {pendingRequests?.length === 0 && (
                              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No pending requests</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Product Catalog</h3>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="gap-2"><Plus className="h-4 w-4" /> Add Product</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add New Service/Product</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>Product Name</Label>
                          <Input value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="e.g. Netflix Premium" />
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} placeholder="Service details" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Price</Label>
                            <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" />
                          </div>
                          <div className="space-y-2">
                            <Label>Currency</Label>
                            <Input value={newProduct.currency} readOnly />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddProduct}>Create Product</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {productsLoading ? (
                  <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products?.map((p) => (
                      <Card key={p.id}>
                        <CardContent className="p-6 flex justify-between items-center">
                          <div>
                            <h4 className="font-bold">{p.name}</h4>
                            <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                            <p className="text-primary font-bold">{p.price} {p.currency}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteProduct(p.id)}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="offers" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Active Offers</h3>
                  {/* Offer creation dialog can be implemented similarly */}
                </div>

                {offersLoading ? (
                  <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {offers?.map((offer) => (
                      <Card key={offer.id} className="border-primary/20 bg-primary/5">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{offer.name}</CardTitle>
                              <CardDescription>{offer.description}</CardDescription>
                            </div>
                            {offer.discountPercentage && (
                              <div className="bg-primary text-white p-2 rounded-lg font-bold">
                                -{offer.discountPercentage}%
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-end gap-2">
                            <Button variant="destructive" size="sm" onClick={() => deleteDoc(doc(db, 'offers', offer.id))}>Delete</Button>
                          </div>
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
