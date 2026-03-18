
'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * يستمع لأخطاء الصلاحيات العالمية.
 * تم تعديله ليكون صامتاً تماماً أثناء مرحلة البناء (Static Generation).
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    // التأكد من التشغيل فقط في المتصفح
    if (typeof window === 'undefined') return;

    const handleError = (error: FirestorePermissionError) => {
      console.error("Firestore Permission Denied:", error.message);
    };

    errorEmitter.on('permission-error', handleError);
    return () => errorEmitter.off('permission-error', handleError);
  }, []);

  return null;
}
