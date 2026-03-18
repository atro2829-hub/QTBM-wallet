
"use client";

import React from 'react';
import { AdminDashboardContent } from '@/components/admin/AdminDashboard';

/**
 * Main Admin Dashboard Page.
 * Uses the refactored AdminDashboardContent component to avoid invalid page-to-page imports.
 */
export default function AdminDashboard() {
  return <AdminDashboardContent />;
}
