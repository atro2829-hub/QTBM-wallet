
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Listens for global permission errors and handles them gracefully.
 * Fixed: Robust hydration check to prevent build-time crashes.
 */
export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleError = (error: FirestorePermissionError) => {
      setError(error);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // NEVER throw errors during build time or before mounting
  useEffect(() => {
    if (mounted && error && typeof window !== 'undefined') {
      // In a real app, we might redirect or show a toast instead of crashing the UI
      console.error("Firestore Permission Denied:", error.message);
    }
  }, [mounted, error]);

  return null;
}
