
"use client";

import React from 'react';
import { AdminDashboardContent } from '@/components/admin/AdminDashboard';

/**
 * Portfolio version of Admin Dashboard.
 * Fixes "Internal Server Error" by using the refactored shared content component.
 */
export default function PortfolioAdminDashboard() {
  return <AdminDashboardContent />;
}
