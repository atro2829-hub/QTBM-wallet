
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
  ArrowRightLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where, orderBy, setDoc } from 'firebase/firestore';
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
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    currency: 'USD',
    iconName: 'ShoppingCart',
    description: ''
  });

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

  const usersQuery = useMemoFirebase(() => collection(db, 'users'), [db]);
  const { data: allUsers, isLoading: usersLoading } = useCollection(usersQuery);

  const chatsQuery = useMemoFirebase(() => collection(db, 'support_chats'), [db]);
  const { data: chats, isLoading: chatsLoading } = useCollection(chatsQuery);

  const handleUpdateConfig = () => {
    const configPath = doc(db, 'system', 'config');
    setDocumentNonBlocking(configPath, {
      contactPhone: editingConfig.phone || config?.contactPhone || '775371829',
      contactEmail: editingConfig.email || config?.contactEmail || 'support@qtbm.com',
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "تم التحديث", description: "تم حفظ إعدادات النظام بنجاح." });
  };

  const handleApprove = (requestId: string) => {
    const requestRef = doc(db, 'depositRequests', requestId);
    updateDocumentNonBlocking(requestRef, {
      status: 'approved',
      processedAt: serverTimestamp()
    });
    toast({ title: "تمت الموافقة", description: "تم تأكيد طلب الإيداع." });
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) return;
    const productsRef = collection(db, 'products');
    addDocumentNonBlocking(productsRef, {
      ...newProduct,
      price: parseFloat(newProduct.price),
      isActive: true,
      createdAt: serverTimestamp()
    });
    setNewProduct({ name: '', price: '', currency: 'USD', iconName: 'ShoppingCart', description: '' });
    setIsAddingProduct(false);
    toast({ title: "تمت الإضافة", description: "تم إضافة المنتج الجديد للكتالوج." });
  };

  const handleDeleteProduct = (productId: string) => {
    const productRef = doc(db, 'products', productId);
    deleteDocumentNonBlocking(productRef);
    toast({ title: "تم الحذف", description: "تم إزالة المنتج من القائمة." });
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
                  <span>الموافقات المالية</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} className="h-12 rounded-xl font-black">
                  <Users className="h-5 w-5 ml-2" />
                  <span>إدارة المستخدمين</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} className="h-12 rounded-xl font-black">
                  <Package className="h-5 w-5 ml-2" />
                  <span>كتالوج الخدمات</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'support'} onClick={() => setActiveTab('support')} className="h-12 rounded-xl font-black">
                  <MessageSquare className="h-5 w-5 ml-2" />
                  <span>الشكاوى والدعم</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'system'} onClick={() => setActiveTab('system')} className="h-12 rounded-xl font-black">
                  <Settings className="h-5 w-5 ml-2" />
                  <span>إعدادات النظام</span>
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
              <h2 className="text-lg font-black tracking-tight uppercase">لوحة تحكم QTBM</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/20 text-primary font-black">Live System</Badge>
            </div>
          </header>

          <main className="p-8 space-y-8 max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <TabsContent value="approvals" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden glass-morphism">
                  <CardHeader className="bg-primary/5 p-8 text-right">
                    <CardTitle className="text-2xl font-black">تأكيد الإيداعات</CardTitle>
                    <CardDescription>مراجعة طلبات شحن الأرصدة المعلقة.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right">
                        <thead className="bg-muted text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                          <tr>
                            <th className="px-8 py-4">المستخدم</th>
                            <th className="px-8 py-4">تفاصيل التحويل</th>
                            <th className="px-8 py-4">المبلغ</th>
                            <th className="px-8 py-4 text-left">الإجراء</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {requestsLoading ? (
                             <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                          ) : pendingRequests?.map((req) => (
                            <tr key={req.id} className="hover:bg-accent/30 transition-colors text-xs font-bold">
                              <td className="px-8 py-6">{req.userId}</td>
                              <td className="px-8 py-6 font-mono text-[10px]">{req.externalTransactionDetails}</td>
                              <td className="px-8 py-6">
                                <span className="text-lg font-black">{req.amount}</span> {req.currency}
                              </td>
                              <td className="px-8 py-6 text-left">
                                <Button size="sm" className="rounded-xl bg-green-500 hover:bg-green-600 font-black" onClick={() => handleApprove(req.id)}>موافقة</Button>
                              </td>
                            </tr>
                          ))}
                          {pendingRequests?.length === 0 && (
                            <tr><td colSpan={4} className="p-12 text-center text-muted-foreground font-black opacity-50">لا توجد طلبات معلقة حالياً</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden glass-morphism">
                  <CardHeader className="bg-primary/5 p-8 text-right">
                    <CardTitle className="text-2xl font-black">إدارة المستخدمين</CardTitle>
                    <CardDescription>عرض والتحكم في حسابات المستخدمين المسجلين.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="overflow-x-auto">
                       <table className="w-full text-right">
                         <thead className="bg-muted text-[10px] uppercase font-black text-muted-foreground">
                           <tr>
                             <th className="px-8 py-4">الاسم</th>
                             <th className="px-8 py-4">الهاتف</th>
                             <th className="px-8 py-4">المدينة</th>
                             <th className="px-8 py-4">الحالة</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y">
                           {usersLoading ? (
                             <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                           ) : allUsers?.map((u) => (
                             <tr key={u.id} className="hover:bg-accent/30 transition-colors text-xs font-bold">
                               <td className="px-8 py-6">{u.fullName}</td>
                               <td className="px-8 py-6">{u.phoneNumber}</td>
                               <td className="px-8 py-6">{u.city}</td>
                               <td className="px-8 py-6">
                                 <Badge variant="secondary" className="rounded-full font-black text-[9px] uppercase">{u.role}</Badge>
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
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-black">كتالوج الخدمات</h3>
                  <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                    <DialogTrigger asChild>
                      <Button className="rounded-2xl gap-2 font-black shadow-lg">
                        <PlusCircle className="h-5 w-5" />
                        إضافة منتج جديد
                      </Button>
                    </DialogTrigger>
                    <DialogContent dir="rtl" className="rounded-[2rem]">
                      <DialogHeader>
                        <DialogTitle className="font-black text-xl text-right">إضافة منتج رقمي جديد</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2 text-right">
                          <Label className="font-bold">اسم المنتج</Label>
                          <Input 
                            value={newProduct.name}
                            onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                            className="rounded-xl h-12"
                            placeholder="مثلاً: Spotify Premium"
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
                        <Button className="w-full h-14 rounded-2xl font-black" onClick={handleAddProduct}>حفظ المنتج</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {products?.map((product) => (
                     <Card key={product.id} className="rounded-3xl border-none shadow-lg overflow-hidden glass-morphism group">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                              <Package className="h-6 w-6" />
                            </div>
                            <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <h4 className="font-black text-lg mb-1">{product.name}</h4>
                          <p className="text-2xl font-black text-primary tracking-tighter">{product.price} <span className="text-sm">{product.currency}</span></p>
                          <Badge className="mt-4 rounded-full font-black text-[9px] uppercase">Active Service</Badge>
                        </CardContent>
                     </Card>
                   ))}
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden glass-morphism">
                  <CardHeader className="bg-primary/5 p-8 text-right">
                    <CardTitle className="text-2xl font-black">إعدادات المنصة</CardTitle>
                    <CardDescription>إدارة بيانات التواصل والأسعار العامة.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2 text-right">
                        <Label className="font-bold">رقم هاتف التواصل</Label>
                        <Input 
                          placeholder={config?.contactPhone || "775371829"} 
                          onChange={(e) => setEditingConfig({...editingConfig, phone: e.target.value})}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2 text-right">
                        <Label className="font-bold">البريد الإلكتروني للدعم</Label>
                        <Input 
                          placeholder={config?.contactEmail || "support@qtbm.com"} 
                          onChange={(e) => setEditingConfig({...editingConfig, email: e.target.value})}
                          className="h-12 rounded-xl"
                        />
                      </div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl font-black shadow-xl" onClick={handleUpdateConfig}>
                      حفظ إعدادات النظام
                    </Button>
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
