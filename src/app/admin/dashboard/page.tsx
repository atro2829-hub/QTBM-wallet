
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Save,
  Loader2,
  ShieldAlert,
  Calendar,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection, useMemoFirebase, useDoc, useUser } from '@/firebase';
import { collection, doc, serverTimestamp, query, where, increment, addDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AppLogo } from '@/components/layout/AppLogo';
import { updateDocumentNonBlocking, setDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function AdminDashboard() {
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const [activeTab, setActiveTab] = useState('approvals');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingPlan, setIsAddingPlan] = useState(false);
  
  const userProfileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [db, user]);
  const { data: profile, isLoading: profileLoading } = useDoc(userProfileRef);

  const [newProduct, setNewProduct] = useState({ name: '', category: '', price: '', currency: 'USD', iconName: 'Package', imageUrl: '', description: '' });
  const [newPlan, setNewPlan] = useState({ name: '', minAmount: '20', durationDays: '30', interestRate: '8', description: '' });

  const configRef = useMemoFirebase(() => doc(db, 'system', 'config'), [db]);
  const { data: config } = useDoc(configRef);
  
  const [rates, setRates] = useState({ usdToYerRate: '1500', usdToSarRate: '3.75', usdtCommission: '5', phone: '', email: '' });

  useEffect(() => {
    if (config) {
      setRates({
        usdToYerRate: config.usdToYerRate?.toString() || '1500',
        usdToSarRate: config.usdToSarRate?.toString() || '3.75',
        usdtCommission: (config.usdtCommission * 100)?.toString() || '5',
        phone: config.contactPhone || '',
        email: config.contactEmail || 'support@qtbm.com'
      });
    }
  }, [config]);

  useEffect(() => {
    if (!isUserLoading && !profileLoading && profile) {
      if (profile.role !== 'admin') { router.push('/dashboard'); }
    }
  }, [profile, isUserLoading, profileLoading, router]);

  const productsQuery = useMemoFirebase(() => collection(db, 'products'), [db]);
  const { data: products } = useCollection(productsQuery);

  const plansQuery = useMemoFirebase(() => collection(db, 'investment_plans'), [db]);
  const { data: plans } = useCollection(plansQuery);

  const pendingDepositsQuery = useMemoFirebase(() => query(collection(db, 'depositRequests'), where('status', '==', 'pending')), [db]);
  const { data: pendingDeposits } = useCollection(pendingDepositsQuery);

  const pendingWithdrawsQuery = useMemoFirebase(() => query(collection(db, 'withdrawRequests'), where('status', '==', 'pending')), [db]);
  const { data: pendingWithdraws } = useCollection(pendingWithdrawsQuery);

  if (isUserLoading || profileLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  const handleUpdateSystem = () => {
    setDocumentNonBlocking(configRef, {
      contactPhone: rates.phone || config?.contactPhone || '775371829',
      contactEmail: rates.email || config?.contactEmail || 'support@qtbm.com',
      usdToYerRate: parseFloat(rates.usdToYerRate),
      usdToSarRate: parseFloat(rates.usdToSarRate),
      usdtCommission: parseFloat(rates.usdtCommission) / 100,
      updatedAt: serverTimestamp()
    }, { merge: true });
    toast({ title: "تم التحديث بنجاح" });
  };

  const handleApproveDeposit = (req: any) => {
    const requestRef = doc(db, 'depositRequests', req.id);
    const walletRef = doc(db, 'users', req.userId, 'wallet', 'wallet');
    const currencyField = `${req.currency.toLowerCase()}Balance`;
    updateDocumentNonBlocking(requestRef, { status: 'approved', processedAt: serverTimestamp() });
    updateDocumentNonBlocking(walletRef, { [currencyField]: increment(req.amount), updatedAt: serverTimestamp() });
    toast({ title: "تمت الموافقة والإضافة" });
  };

  const handleApproveWithdraw = (req: any) => {
    const requestRef = doc(db, 'withdrawRequests', req.id);
    const walletRef = doc(db, 'users', req.userId, 'wallet', 'wallet');
    const currencyField = `${req.currency.toLowerCase()}Balance`;
    updateDocumentNonBlocking(requestRef, { status: 'approved', processedAt: serverTimestamp() });
    updateDocumentNonBlocking(walletRef, { [currencyField]: increment(-req.amount), updatedAt: serverTimestamp() });
    toast({ title: "تم تنفيذ السحب بنجاح" });
  };

  const handleAddPlan = () => {
    if (!newPlan.name || !newPlan.minAmount) return;
    addDocumentNonBlocking(collection(db, 'investment_plans'), {
      ...newPlan,
      minAmount: parseFloat(newPlan.minAmount),
      durationDays: parseInt(newPlan.durationDays),
      interestRate: parseFloat(newPlan.interestRate),
      isActive: true,
      createdAt: serverTimestamp()
    });
    setNewPlan({ name: '', minAmount: '20', durationDays: '30', interestRate: '8', description: '' });
    setIsAddingPlan(false);
    toast({ title: "تمت إضافة الخطة" });
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full" dir="rtl">
        <Sidebar variant="sidebar" side="right" className="border-l shadow-xl">
          <SidebarHeader className="p-8"><AppLogo /></SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} className="h-12 rounded-xl font-black">
                  <ArrowDownLeft className="h-5 w-5 ml-2" /> <span>طلبات الإيداع</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'withdraws'} onClick={() => setActiveTab('withdraws')} className="h-12 rounded-xl font-black">
                  <Banknote className="h-5 w-5 ml-2" /> <span>طلبات السحب</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'investments'} onClick={() => setActiveTab('investments')} className="h-12 rounded-xl font-black">
                  <TrendingUp className="h-5 w-5 ml-2" /> <span>إدارة الاستثمار</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'products'} onClick={() => setActiveTab('products')} className="h-12 rounded-xl font-black">
                  <Layers className="h-5 w-5 ml-2" /> <span>إدارة الخدمات</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'system'} onClick={() => setActiveTab('system')} className="h-12 rounded-xl font-black">
                  <Settings className="h-5 w-5 ml-2" /> <span>إعدادات الصرف</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1 bg-muted/30 overflow-y-auto">
          <header className="h-20 border-b px-8 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-xl z-10 shadow-sm">
            <div className="flex items-center gap-4"><SidebarTrigger /><h2 className="text-lg font-black uppercase">لوحة تحكم المسؤول</h2></div>
            <Badge variant="outline" className="border-primary/20 text-primary font-black">نظام QTBM v2.5</Badge>
          </header>

          <main className="p-8 space-y-8 max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              
              <TabsContent value="approvals" className="space-y-6">
                <Card className="rounded-[2.5rem] overflow-hidden glass-morphism border-none shadow-xl">
                  <CardHeader className="bg-primary/5 p-8 text-right"><CardTitle className="text-2xl font-black">طلبات الإيداع المعلقة</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-right">
                      <thead className="bg-muted text-[10px] font-black uppercase tracking-widest text-muted-foreground"><tr><th className="px-8 py-4">UID</th><th className="px-8 py-4">المبلغ</th><th className="px-8 py-4">العملة</th><th className="px-8 py-4">الإجراء</th></tr></thead>
                      <tbody className="divide-y">{pendingDeposits?.map((req) => (
                        <tr key={req.id} className="hover:bg-accent/30 font-bold transition-colors"><td className="px-8 py-6 text-xs font-mono">{req.userId}</td><td className="px-8 py-6 text-lg">{req.amount.toLocaleString()}</td><td className="px-8 py-6">{req.currency}</td><td className="px-8 py-6"><Button size="sm" className="rounded-xl bg-green-500 font-black hover:bg-green-600" onClick={() => handleApproveDeposit(req)}>موافقة</Button></td></tr>
                      ))}</tbody>
                    </table>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="investments" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-black">خطط الاستثمار المتاحة</h3>
                  <Dialog open={isAddingPlan} onOpenChange={setIsAddingPlan}>
                    <DialogTrigger asChild><Button className="rounded-2xl gap-2 font-black shadow-lg"><PlusCircle className="h-5 w-5" /> إضافة خطة</Button></DialogTrigger>
                    <DialogContent dir="rtl" className="rounded-[2rem] max-w-md border-none shadow-2xl">
                      <DialogHeader><DialogTitle className="text-right">إضافة خطة استثمارية</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2"><Label className="text-xs font-black">اسم الخطة</Label><Input value={newPlan.name} onChange={(e) => setNewPlan({...newPlan, name: e.target.value})} placeholder="خطة النمو الشهري" /></div>
                        <div className="grid grid-cols-3 gap-3">
                           <div className="space-y-2"><Label className="text-xs font-black">الحد الأدنى ($)</Label><Input type="number" value={newPlan.minAmount} onChange={(e) => setNewPlan({...newPlan, minAmount: e.target.value})} /></div>
                           <div className="space-y-2"><Label className="text-xs font-black">المدة (أيام)</Label><Input type="number" value={newPlan.durationDays} onChange={(e) => setNewPlan({...newPlan, durationDays: e.target.value})} /></div>
                           <div className="space-y-2"><Label className="text-xs font-black">النسبة (%)</Label><Input type="number" value={newPlan.interestRate} onChange={(e) => setNewPlan({...newPlan, interestRate: e.target.value})} /></div>
                        </div>
                        <div className="space-y-2"><Label className="text-xs font-black">وصف بسيط</Label><Input value={newPlan.description} onChange={(e) => setNewPlan({...newPlan, description: e.target.value})} /></div>
                      </div>
                      <DialogFooter className="mt-6"><Button onClick={handleAddPlan} className="w-full h-12 rounded-xl">حفظ الخطة</Button></DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {plans?.map((plan) => (
                    <Card key={plan.id} className="rounded-2xl glass-morphism border-none shadow-sm relative overflow-hidden">
                       <CardHeader className="p-6 bg-emerald-500/5 border-b border-emerald-500/10">
                          <CardTitle className="text-lg font-black">{plan.name}</CardTitle>
                          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">{plan.interestRate}% عائد</Badge>
                       </CardHeader>
                       <CardContent className="p-6 space-y-4">
                          <div className="flex justify-between text-xs font-bold text-muted-foreground">
                             <span>المدة: {plan.durationDays} يوم</span>
                             <span>الحد الأدنى: {plan.minAmount} $</span>
                          </div>
                          <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10" onClick={() => deleteDocumentNonBlocking(doc(db, 'investment_plans', plan.id))}>حذف الخطة</Button>
                       </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="system" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="rounded-[2.5rem] border-none shadow-2xl glass-morphism p-8 space-y-6">
                    <CardTitle className="text-xl font-black text-right">إعدادات الصرف والعمولات</CardTitle>
                    <div className="space-y-4 text-right">
                      <div className="space-y-2"><Label className="font-bold text-xs">سعر صرف USD إلى YER</Label><Input value={rates.usdToYerRate} onChange={(e) => setRates({...rates, usdToYerRate: e.target.value})} className="h-12 rounded-xl font-mono text-lg" /></div>
                      <div className="space-y-2"><Label className="font-bold text-xs">سعر صرف USD إلى SAR</Label><Input value={rates.usdToSarRate} onChange={(e) => setRates({...rates, usdToSarRate: e.target.value})} className="h-12 rounded-xl font-mono text-lg" /></div>
                      <div className="space-y-2"><Label className="font-bold text-xs">عمولة الكريبتو USDT (%)</Label><Input value={rates.usdtCommission} onChange={(e) => setRates({...rates, usdtCommission: e.target.value})} className="h-12 rounded-xl font-mono text-lg" /></div>
                    </div>
                    <Button className="w-full h-14 rounded-2xl font-black text-lg" onClick={handleUpdateSystem}><Save className="h-5 w-5 ml-2" /> حفظ الإعدادات</Button>
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
