
"use client";

import React from 'react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShoppingBag, 
  LayoutDashboard, 
  Package, 
  Settings, 
  ChevronRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useWalletStore } from '@/app/lib/store';
import { Button } from '@/components/ui/button';
import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  const { transactions, updateTransactionStatus, updateBalance } = useWalletStore();
  
  const pendingTransactions = transactions.filter(t => t.status === 'Pending');

  const handleAction = (id: string, approve: boolean) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;
    
    if (approve) {
      updateTransactionStatus(id, 'Completed');
      // In a real app, you'd handle the recipient balance update here too
    } else {
      updateTransactionStatus(id, 'Failed');
      // Refund the sender if it was a send/purchase
      if (tx.type === 'send' || tx.type === 'purchase') {
        updateBalance(tx.currency, tx.amount);
      }
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
                <SidebarMenuButton isActive>
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="h-4 w-4" />
                  <span>User Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Package className="h-4 w-4" />
                  <span>Product Management</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="h-4 w-4" />
                  <span>System Settings</span>
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
              <h2 className="text-lg font-bold">Management Dashboard</h2>
            </div>
            <div className="flex gap-4">
              <Button variant="outline" size="sm">Export Report</Button>
              <Button size="sm">New Alert</Button>
            </div>
          </header>

          <main className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                      <h3 className="text-2xl font-bold">1,284</h3>
                    </div>
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Volume (USD)</p>
                      <h3 className="text-2xl font-bold">$42,910</h3>
                    </div>
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                      <ArrowDownLeft className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                      <h3 className="text-2xl font-bold">{pendingTransactions.length}</h3>
                    </div>
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-80">System Health</p>
                      <h3 className="text-2xl font-bold">Optimal</h3>
                    </div>
                    <div className="p-2 bg-white/20 rounded-lg">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Pending Transaction Approvals</CardTitle>
                <CardDescription>Review and verify user requests before processing.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-muted-foreground font-bold">
                      <tr>
                        <th className="px-6 py-4 text-left">Type</th>
                        <th className="px-6 py-4 text-left">Description</th>
                        <th className="px-6 py-4 text-left">Amount</th>
                        <th className="px-6 py-4 text-left">User ID</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pendingTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                            No pending transactions found.
                          </td>
                        </tr>
                      ) : (
                        pendingTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-accent/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className={cn(
                                "px-2 py-1 rounded-md text-[10px] font-bold uppercase",
                                tx.type === 'deposit' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                              )}>
                                {tx.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-medium">{tx.description}</td>
                            <td className="px-6 py-4 font-bold">{tx.amount.toLocaleString()} {tx.currency}</td>
                            <td className="px-6 py-4 font-mono text-xs">{tx.recipientUid || 'SENDER-ID'}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleAction(tx.id, true)}
                                >
                                  <CheckCircle2 className="h-5 w-5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleAction(tx.id, false)}
                                >
                                  <XCircle className="h-5 w-5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
