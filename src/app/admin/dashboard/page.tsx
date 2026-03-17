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
  Tag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWalletStore, Currency } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { transactions, updateTransactionStatus, products, addProduct, deleteProduct } = useWalletStore();
  const [activeTab, setActiveTab] = useState('transactions');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', currency: 'USD' as Currency, icon: 'ShoppingBag' });

  const pendingTransactions = transactions.filter(t => t.status === 'Pending');

  const handleAction = (id: string, approve: boolean) => {
    updateTransactionStatus(id, approve ? 'Completed' : 'Failed');
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    addProduct({
      id: Math.random().toString(36).substr(2, 9),
      name: newProduct.name,
      price: parseFloat(newProduct.price),
      currency: newProduct.currency,
      icon: newProduct.icon
    });
    setNewProduct({ name: '', price: '', currency: 'USD', icon: 'ShoppingBag' });
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                      <h3 className="text-2xl font-bold">{pendingTransactions.length}</h3>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm font-medium text-muted-foreground">Active Products</p>
                      <h3 className="text-2xl font-bold">{products.length}</h3>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Approvals Needed</CardTitle>
                    <CardDescription>Deposits and transfers awaiting confirmation.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground">
                          <tr>
                            <th className="px-6 py-4 text-left">Type</th>
                            <th className="px-6 py-4 text-left">Details</th>
                            <th className="px-6 py-4 text-left">Amount</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {pendingTransactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-accent/50">
                              <td className="px-6 py-4">
                                <span className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", tx.type === 'deposit' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                                  {tx.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 font-medium">{tx.description}</td>
                              <td className="px-6 py-4 font-bold">{tx.amount} {tx.currency}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" className="text-green-600" onClick={() => handleAction(tx.id, true)}><CheckCircle2 className="h-5 w-5" /></Button>
                                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleAction(tx.id, false)}><XCircle className="h-5 w-5" /></Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="p-6 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold">{p.name}</h4>
                          <p className="text-primary font-bold">{p.price} {p.currency}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => deleteProduct(p.id)}>
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
