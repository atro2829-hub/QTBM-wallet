
"use client";

import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  Package, 
  Plus,
  Trash2,
  Settings,
  Users,
  Layers,
  Banknote,
  PlusCircle,
  Image as ImageIcon,
  TrendingUp,
  Percent,
  Coins,
  Globe,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, serverTimestamp, query, where, increment } from 'firebase/firestore';
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
    imageUrl: '',
    description: ''
  });

  const configRef = useMemoFirebase(() => doc(db, 'system', 'config'), [db]);
  const { data: config } = useDoc(configRef);
  
  const [rates, setRates] = useState({
    usdToYerRate: '1500',
    usdToSarRate: '3.75',
    usdtCommission: '5',
    phone: '',
    email: ''
  });

  useEffect(() => {
    if (config) {
      setRates({
        usdToYerRate: config.usdToYerRate?.toString() || '1500',
        usdToSarRate: config.usdToSarRate?.toString() || '3.75',
        usdtCommission: (config.usdtCommission * 100)?.toString() || '5',
        phone: config.contactPhone || '',
        email: config.contactEmail || ''
      });
    }
  }, [config]);

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products } = useCollection(productsQuery);

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

  const handleUpdateSystem = () => {
    setDocumentNonBlocking(configRef, {
      contactPhone: rates.phone || config?.contactPhone || '775371829',
      contactEmail: rates.email || config?.contactEmail || 'support@qtbm.com',
      usdToYerRate: parseFloat(rates.usdToYerRate),
      usdToSarRate: parseFloat(rates.usdToSarRate),
      usdtCommission: parseFloat(rates.usdtCommission) / 100,
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "تم التحديث", description: "تم حفظ إعدادات النظام وأسعار الصرف بنجاح." });
  };

  const handleApproveDeposit = (req: any) => {
    const requestRef = doc(db, 'depositRequests', req.id);
    const walletRef = doc(db, 'users', req.userId, 'wallet', 'wallet');
    const currencyField = `${req.currency.toLowerCase()}Balance`;

    updateDocumentNonBlocking(requestRef, { status: 'approved', processedAt: serverTimestamp() });
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

    updateDocumentNonBlocking(requestRef, { status: 'approved', processedAt: serverTimestamp() });
    updateDocumentNonBlocking(walletRef, {
      [currencyField]: increment(-req.amount),
      updatedAt: serverTimestamp()
    });

    toast({ title: "تم تنفيذ السحب", description: `تم خصم ${req.amount} ${req.currency} من رصيد المستخدم.` });
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) return;
    const productsRef = collection(db, 'products');
    addDocumentNonBlocking(productsRef, {
      ...newProduct,
      price: parseFloat(newProduct.price),
      isActive: true,
      createdAt: serverTimestamp()
    });
    setNewProduct({ name: '', category: '', price: '', currency: 'USD', iconName: 'Package', imageUrl: '', description: '' });
    setIsAddingProduct(false);
    toast({ title: "تمت الإضافة", description: "تم إضافة المنتج للكتالوج بنجاح." });
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
                  <span>طلبات الإيداع</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'withdraws'} onClick={() => setActiveTab('withdraws')} className="h-12 rounded-xl font-black">
                  <Banknote className="h-5 w-5 ml-2" />
                  <span>طلبات السحب</span>
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
                  <span>إدارة الخدمات</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'system'} onClick={() => setActiveTab('system')} className="h-12 rounded-xl font-black">
                  <Settings className="h-5 w-5 ml-2" />
                  <span>إعدادات الصرف</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 bg-muted/30 overflow-y-auto">
          <header className="h-20 border-b px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-10 shadow-sm">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h2 className="text-lg font-black uppercase tracking-tight">لوحة التحكم الإدارية</h2>
            </div>
            <Badge variant="outline" className="border-primary/20 text-primary font-black">نظام QTBM v2.0</Badge>
          </header>

          <main className="p-8 space-y-8 max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <TabsContent value="approvals" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl glass-morphism overflow-hidden">
                  <CardHeader className="bg-primary/5 p-8 text-right">
                    <CardTitle className="text-2xl font-black">طلبات الإيداع</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-right">
                      <thead className="bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <tr>
                          <th className="px-8 py-4">UID المستخدم</th>
                          <th className="px-8 py-4">المبلغ</th>
                          <th className="px-8 py-4">العملة</th>
                          <th className="px-8 py-4">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pendingDeposits?.map((req) => (
                          <tr key={req.id} className="hover:bg-accent/30 transition-colors font-bold">
                            <td className="px-8 py-6 text-xs font-mono">{req.userId}</td>
                            <td className="px-8 py-6 text-lg">{req.amount.toLocaleString()}</td>
                            <td className="px-8 py-6">{req.currency}</td>
                            <td className="px-8 py-6">
                              <Button size="sm" className="rounded-xl bg-green-500 font-black hover:bg-green-600" onClick={() => handleApproveDeposit(req)}>موافقة وإضافة</Button>
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
                    <CardTitle className="text-2xl font-black">طلبات السحب</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-right">
                      <thead className="bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <tr>
                          <th className="px-8 py-4">UID المستخدم</th>
                          <th className="px-8 py-4">المبلغ</th>
                          <th className="px-8 py-4">العملة</th>
                          <th className="px-8 py-4">الإجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {pendingWithdraws?.map((req) => (
                          <tr key={req.id} className="hover:bg-accent/30 transition-colors font-bold">
                            <td className="px-8 py-6 text-xs font-mono">{req.userId}</td>
                            <td className="px-8 py-6 text-lg">{req.amount.toLocaleString()}</td>
                            <td className="px-8 py-6">{req.currency}</td>
                            <td className="px-8 py-6">
                              <Button size="sm" className="rounded-xl bg-primary font-black hover:bg-primary/90" onClick={() => handleApproveWithdraw(req)}>تنفيذ السحب</Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">كتالوج الخدمات</h3>
                  <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                    <DialogTrigger asChild>
                      <Button className="rounded-2xl gap-2 font-black shadow-lg shadow-primary/20">
                        <PlusCircle className="h-5 w-5" />
                        إضافة منتج بصورة
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="rounded-[2rem] border-none shadow-2xl max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-black text-right">إضافة منتج جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2 text-right">
                           <Label className="text-xs font-black opacity-60">الفئة (مثال: PUBG, Free Fire)</Label>
                           <Input value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} placeholder="أدخل الفئة" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2 text-right">
                           <Label className="text-xs font-black opacity-60">اسم الخدمة</Label>
                           <Input value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} placeholder="مثال: 600 UC" className="h-12 rounded-xl" />
                        </div>
                        <div className="space-y-2 text-right">
                           <Label className="text-xs font-black opacity-60">رابط صورة المنتج (URL)</Label>
                           <div className="relative">
                             <ImageIcon className="absolute right-3 top-3 h-5 w-5 text-muted-foreground" />
                             <Input value={newProduct.imageUrl} onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})} placeholder="https://image-url.com/photo.jpg" className="h-12 rounded-xl pr-10" />
                           </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 text-right">
                             <Label className="text-xs font-black opacity-60">السعر</Label>
                             <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" className="h-12 rounded-xl" />
                          </div>
                          <div className="space-y-2 text-right">
                             <Label className="text-xs font-black opacity-60">العملة</Label>
                             <Select value={newProduct.currency} onValueChange={(v) => setNewProduct({...newProduct, currency: v})}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
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
                        <Button onClick={handleAddProduct} className="w-full h-12 rounded-xl font-black">حفظ وإضافة للمتجر</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products?.map((p) => (
                    <Card key={p.id} className="rounded-2xl shadow-sm border-none glass-morphism overflow-hidden">
                      <div className="h-32 bg-muted relative group overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-20"><Package className="h-10 w-10" /></div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-primary/80 backdrop-blur-md">{p.category}</Badge>
                      </div>
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="text-right">
                          <h4 className="font-black text-sm">{p.name}</h4>
                          <p className="text-primary font-black">{p.price.toLocaleString()} {p.currency}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-xl text-destructive hover:bg-destructive/10" onClick={() => deleteDocumentNonBlocking(doc(db, 'products', p.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="rounded-[2.5rem] border-none shadow-2xl glass-morphism p-8 space-y-6">
                    <div className="text-right">
                      <CardTitle className="text-xl font-black flex items-center gap-2 justify-end">فوارق العملات <TrendingUp className="h-5 w-5 text-primary" /></CardTitle>
                      <CardDescription>تحديد أسعار الصرف مقابل الدولار (USD).</CardDescription>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2 text-right">
                         <Label className="font-bold text-xs">سعر صرف USD إلى YER</Label>
                         <Input value={rates.usdToYerRate} onChange={(e) => setRates({...rates, usdToYerRate: e.target.value})} className="h-12 rounded-xl font-mono text-lg" />
                      </div>
                      <div className="space-y-2 text-right">
                         <Label className="font-bold text-xs">سعر صرف USD إلى SAR</Label>
                         <Input value={rates.usdToSarRate} onChange={(e) => setRates({...rates, usdToSarRate: e.target.value})} className="h-12 rounded-xl font-mono text-lg" />
                      </div>
                      <div className="space-y-2 text-right">
                         <Label className="font-bold text-xs flex items-center gap-1 justify-end">عمولة الكريبتو USDT (%) <Percent className="h-3 w-3" /></Label>
                         <Input value={rates.usdtCommission} onChange={(e) => setRates({...rates, usdtCommission: e.target.value})} className="h-12 rounded-xl font-mono text-lg" />
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-[2.5rem] border-none shadow-2xl glass-morphism p-8 space-y-6">
                    <div className="text-right">
                      <CardTitle className="text-xl font-black flex items-center gap-2 justify-end">بيانات التواصل <Globe className="h-5 w-5 text-blue-500" /></CardTitle>
                      <CardDescription>تحديث بيانات الدعم الفني للمحفظة.</CardDescription>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2 text-right">
                         <Label className="font-bold text-xs">رقم الواتساب للدعم</Label>
                         <Input value={rates.phone} onChange={(e) => setRates({...rates, phone: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2 text-right">
                         <Label className="font-bold text-xs">البريد الإلكتروني</Label>
                         <Input value={rates.email} onChange={(e) => setRates({...rates, email: e.target.value})} className="h-12 rounded-xl" />
                      </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl font-black text-lg shadow-xl mt-4" onClick={handleUpdateSystem}>
                      <Save className="h-5 w-5 ml-2" />
                      حفظ كافة الإعدادات
                    </Button>
                  </Card>
                </div>
              </TabsContent>

            </Tabs>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
