
"use client";

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Dummy page to avoid build errors during static export.
 * Redirects to the search-param based detail page.
 */
export default function TransactionRedirectPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    if (params?.id) {
      router.replace(`/history/detail?id=${params.id}`);
    } else {
      router.replace('/history');
    }
  }, [params, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );
}
