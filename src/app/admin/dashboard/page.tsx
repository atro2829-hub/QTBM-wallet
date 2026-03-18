
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
  Settings,
  Users,
  MessageSquare,
  ShieldCheck,
  Search,
  PlusCircle,
  MoreVertical,
  ArrowRightLeft,
  Layers,
  Banknote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where, orderBy, setDoc, increment } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/layout/AppLogo';
import { updateDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboard() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('approvals');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    currency: 'USD',
    iconName: 'Package',
    description: ''
  });

  const configRef = useMemoFirebase(() => doc(db, 'system', 'config'), [db]);
  const { data: config } = useDoc(configRef);
  const [editingConfig, setEditingConfig] = useState({ phone: '', email: '' });

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);

  const pendingDepositsQuery = useMemoFirebase(() => 
    query(collection(db, 'depositRequests'), where('status', '==', 'pending')), 
  [db]);
  const { data: pendingDeposits } = useCollection(pendingDepositsQuery);

  const pendingWithdrawsQuery = useMemoFirebase(() => 
    query(collection(db, 'withdrawRequests'), where('status', '==', 'pending')), 
  [db]);
  const { data: pendingWithdraws } = useCollection(pendingWithdrawsQuery);

  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: allUsers } = useCollection(usersQuery);

  const handleUpdateConfig = () => {
    const configPath = doc(db, 'system', 'config');
    setDocumentNonBlocking(configPath, {
      contactPhone: editingConfig.phone || config?.contactPhone || '775371829',
      contactEmail: editingConfig.email || config?.contactEmail || 'support@qtbm.com',
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "تم التحديث", description: "تم حفظ إعدادات النظام بنجاح." });
  };

  const handleApproveDeposit = (req: any) => {
    const requestRef = doc(db, 'depositRequests', req.id);
    const walletRef = doc(db, 'users', req.userId, 'wallet', 'wallet');
    const currencyField = `${req.currency.toLowerCase()}Balance`;

    // 1. Approve Request
    updateDocumentNonBlocking(requestRef, { status: 'approved', processedAt: serverTimestamp() });
    
    // 2. Update User Balance
    updateDocumentNonBlocking(walletRef, {
      [currencyField]: increment(req.amount),
      updatedAt: serverTimestamp()
    });

    toast({ title: "تمت الموافقة", description: `تمت إضافة ${req.amount} ${req.currency} إلى رصيد المستخدم.` });
  };

  const handleApproveWithdraw = (req: any) => {
    const requestRef = doc(db, 'withdrawRequests', req.id);
    const walletRef = doc(db, 'users', req.userId, 'wallet', 'wallet');
    const currencyField = `${req.currency.toLowerCase()}Balance`;

    // 1. Approve Request
    updateDocumentNonBlocking(requestRef, { status: 'approved', processedAt: serverTimestamp() });
    
    // 2. Update User Balance (Subtract)
    updateDocumentNonBlocking(walletRef, {
      [currencyField]: increment(-req.amount),
      updatedAt: serverTimestamp()
    });

    toast({ title: "تم تنفيذ السحب", description: `تم خصم ${req.amount} ${req.currency} من رصيد المستخدم.` });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) return;
    const productsRef = collection(db, 'products');
    addDocumentNonBlocking(productsRef, {
      ...newProduct,
      price: parseFloat(newProduct.price),
      isActive: true,
      createdAt: serverTimestamp()
    });
    setNewProduct({ name: '', category: '', price: '', currency: 'USD', iconName: 'Package', description: '' });
    setIsAddingProduct(false);
    toast({ title: "تمت الإضافة", description: "تم إضافة المنتج بنجاح." });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full" dir="rtl">
        <Sidebar variant="sidebar" side="right" className="border-l shadow-xl">
          <SidebarHeader className="p-8">
            <AppLogo />
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} className="h-12 rounded-xl font-black">
                  <ArrowDownLeft className="h-5 w-5 ml-2" />
                  <span>الإيداعات</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'withdraws'} onClick={() => setActiveTab('withdraws')} className="h-12 rounded-xl font-black">
                  <Banknote className="h-5 w-5 ml-2" />
                  <span>السحوبات</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} className="h-12 rounded-xl font-black">
                  <Users className="h-5 w-5 ml-2" />
                  <span>المستخدمين</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} className="h-12 rounded-xl font-black">
                  <Layers className="h-5 w-5 ml-2" />
                  <span>الفئات والخدمات</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'system'} onClick={() => setActiveTab('system')} className="h-12 rounded-xl font-black">
                  <Settings className="h-5 w-5 ml-2" />
                  <span>النظام</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 bg-muted/30 overflow-y-auto">
          <header className="h-20 border-b px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-lg font-black uppercase tracking-tight">إدارة QTBM</h2>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary font-black">نظام حي</Badge>
          </header>

          <main className="p-8 space-y-8 max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <TabsContent value="approvals" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl glass-morphism overflow-hidden">
                  <CardHeader className="bg-primary/5 p-8 text-right">
                    <CardTitle className="text-2xl font-black">طلبات الإيداع المعلقة</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-right">
                      <thead className="bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <tr>
                          <th className="px-8 py-4">المستخدم (UID)</th>
                          <th className="px-8 py-4">المبلغ</th>
                          <th className="px-8 py-4">العملة</th>
                          <th className="px-8 py-4">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pendingDeposits?.map((req) => (
                          <tr key={req.id} className="hover:bg-accent/30 transition-colors font-bold">
                            <td className="px-8 py-6 text-xs font-mono">{req.userId}</td>
                            <td className="px-8 py-6 text-lg">{req.amount}</td>
                            <td className="px-8 py-6">{req.currency}</td>
                            <td className="px-8 py-6">
                              <Button size="sm" className="rounded-xl bg-green-500 font-black" onClick={() => handleApproveDeposit(req)}>موافقة</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="withdraws" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl glass-morphism overflow-hidden">
                  <CardHeader className="bg-primary/5 p-8 text-right">
                    <CardTitle className="text-2xl font-black">طلبات السحب المعلقة</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-right">
                      <thead className="bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <tr>
                          <th className="px-8 py-4">المستخدم</th>
                          <th className="px-8 py-4">المبلغ</th>
                          <th className="px-8 py-4">العملة</th>
                          <th className="px-8 py-4">التفاصيل</th>
                          <th className="px-8 py-4">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pendingWithdraws?.map((req) => (
                          <tr key={req.id} className="hover:bg-accent/30 transition-colors font-bold">
                            <td className="px-8 py-6 text-xs font-mono">{req.userId}</td>
                            <td className="px-8 py-6 text-lg">{req.amount}</td>
                            <td className="px-8 py-6">{req.currency}</td>
                            <td className="px-8 py-6 text-xs">{req.details}</td>
                            <td className="px-8 py-6">
                              <Button size="sm" className="rounded-xl bg-primary font-black" onClick={() => handleApproveWithdraw(req)}>تنفيذ</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                 <Card className="rounded-[2.5rem] border-none shadow-2xl glass-morphism overflow-hidden">
                    <CardHeader className="bg-primary/5 p-8 text-right">
                      <CardTitle className="text-2xl font-black">قائمة المستخدمين</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <table className="w-full text-right">
                        <thead className="bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <tr>
                            <th className="px-8 py-4">الاسم</th>
                            <th className="px-8 py-4">رقم الهاتف</th>
                            <th className="px-8 py-4">UID</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {allUsers?.map((user) => (
                            <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                              <td className="px-8 py-6 font-bold">{user.fullName}</td>
                              <td className="px-8 py-6">{user.phoneNumber}</td>
                              <td className="px-8 py-6 font-mono text-xs">{user.id}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">كتالوج الخدمات المنظم</h3>
                  <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                    <DialogTrigger asChild>
                      <Button className="rounded-2xl gap-2 font-black shadow-lg">
                        <PlusCircle className="h-5 w-5" />
                        إضافة خدمة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="font-black text-xl text-right">إضافة منتج/لعبة جديدة</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2 text-right">
                          <Label className="font-bold">اسم الفئة (مثلاً: PUBG Mobile)</Label>
                          <Input 
                            value={newProduct.category}
                            onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                            className="rounded-xl h-12"
                            placeholder="اسم اللعبة أو الخدمة الرئيسية"
                          />
                        </div>
                        <div className="space-y-2 text-right">
                          <Label className="font-bold">اسم المنتج الفرعي</Label>
                          <Input 
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            className="rounded-xl h-12"
                            placeholder="مثلاً: 600 UC"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 text-right">
                            <Label className="font-bold">السعر</Label>
                            <Input 
                              type="number"
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              className="rounded-xl h-12"
                            />
                          </div>
                          <div className="space-y-2 text-right">
                            <Label className="font-bold">العملة</Label>
                            <Select value={newProduct.currency} onValueChange={(v) => setNewProduct({...newProduct, currency: v})}>
                              <SelectTrigger className="rounded-xl h-12"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="USD">USD</SelectItem>
                                <SelectItem value="YER">YER</SelectItem>
                                <SelectItem value="SAR">SAR</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button className="w-full h-14 rounded-2xl font-black" onClick={handleAddProduct}>حفظ في القائمة</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {products?.map((product) => (
                     <Card key={product.id} className="rounded-3xl border-none shadow-lg glass-morphism overflow-hidden group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <Badge variant="secondary" className="font-black text-[10px] uppercase">{product.category}</Badge>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => deleteDocumentNonBlocking(doc(db, 'products', product.id))}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <h4 className="font-black text-lg mb-1">{product.name}</h4>
                          <p className="text-2xl font-black text-primary tracking-tighter">{product.price} <span className="text-sm">{product.currency}</span></p>
                        </CardContent>
                     </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl glass-morphism">
                  <CardHeader className="bg-primary/5 p-8 text-right">
                    <CardTitle className="text-2xl font-black">إعدادات المنصة</CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6 text-right">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="font-bold">رقم هاتف التواصل</Label>
                        <Input placeholder={config?.contactPhone || "775371829"} onChange={(e) => setEditingConfig({...editingConfig, phone: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">البريد الإلكتروني</Label>
                        <Input placeholder={config?.contactEmail || "support@qtbm.com"} onChange={(e) => setEditingConfig({...editingConfig, email: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl font-black shadow-xl" onClick={handleUpdateConfig}>حفظ التغييرات</Button>
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
