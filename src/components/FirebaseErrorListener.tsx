'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * يستمع لأخطاء الصلاحيات العالمية.
 * تم التأمين لمنع أخطاء البناء (Build-time errors).
 */
export function FirebaseErrorListener() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleError = (error: FirestorePermissionError) => {
      if (typeof window !== 'undefined') {
        console.error("Firestore Permission Denied:", error.message);
      }
    };

    errorEmitter.on('permission-error', handleError);
    return () => errorEmitter.off('permission-error', handleError);
  }, []);

  return null;
}
