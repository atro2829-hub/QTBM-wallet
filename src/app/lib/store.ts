
"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'YER' | 'USD' | 'SAR';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'deposit' | 'purchase';
  description: string;
  amount: number;
  currency: Currency;
  status: 'Pending' | 'Completed' | 'Failed';
  date: string;
  recipientUid?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  icon: string;
}

interface User {
  uid: string;
  email: string;
  name: string;
  balances: Record<Currency, number>;
}

interface WalletStore {
  user: User | null;
  transactions: Transaction[];
  products: Product[];
  depositRequests: Transaction[];
  setUser: (user: User | null) => void;
  addTransaction: (tx: Transaction) => void;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
  updateBalance: (currency: Currency, amount: number) => void;
  addProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
}

export const useWalletStore = create<WalletStore>()(
  persist(
    (set) => ({
      user: {
        uid: 'QTBM-9921-X',
        email: 'user@example.com',
        name: 'John Doe',
        balances: {
          YER: 50000,
          USD: 1250,
          SAR: 4500,
        },
      },
      transactions: [
        {
          id: '1',
          type: 'deposit',
          description: 'Initial Deposit',
          amount: 100,
          currency: 'USD',
          status: 'Completed',
          date: '2023-10-25T10:00:00Z',
        },
        {
          id: '2',
          type: 'send',
          description: 'To Alice (UID: ALICE-01)',
          amount: 50,
          currency: 'USD',
          status: 'Pending',
          date: '2023-11-01T14:30:00Z',
          recipientUid: 'ALICE-01',
        },
      ],
      products: [
        { id: 'p1', name: 'Spotify Premium', price: 9.99, currency: 'USD', icon: 'Music' },
        { id: 'p2', name: 'Netflix Subscription', price: 15.99, currency: 'USD', icon: 'Tv' },
        { id: 'p3', name: 'PUBG UC (600)', price: 10, currency: 'USD', icon: 'Gamepad2' },
      ],
      depositRequests: [],
      setUser: (user) => set({ user }),
      addTransaction: (tx) => set((state) => ({ transactions: [tx, ...state.transactions] })),
      updateTransactionStatus: (id, status) => 
        set((state) => ({
          transactions: state.transactions.map((tx) => tx.id === id ? { ...tx, status } : tx)
        })),
      updateBalance: (currency, amount) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              balances: {
                ...state.user.balances,
                [currency]: state.user.balances[currency] + amount,
              },
            },
          };
        }),
      addProduct: (product) => set((state) => ({ products: [...state.products, product] })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter(p => p.id !== id) })),
    }),
    {
      name: 'qtbm-wallet-storage',
    }
  )
);
