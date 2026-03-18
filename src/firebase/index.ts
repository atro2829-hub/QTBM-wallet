
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'

/**
 * تهيئة Firebase بشكل آمن لبيئة الأندرويد والتصدير الثابت.
 * تم تعديل المنطق لضمان استخدام firebaseConfig دائماً في حال غياب بيئة Hosting التلقائية.
 */
export function initializeFirebase() {
  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;
  
  try {
    // في بيئة الأندرويد أو التصدير الثابت، نستخدم الإعدادات المباشرة أولاً لضمان الاستقرار
    firebaseApp = initializeApp(firebaseConfig);
  } catch (e) {
    // محاولة أخيرة في حال وجود تهيئة تلقائية من الاستضافة
    try {
      firebaseApp = initializeApp();
    } catch (innerError) {
      console.error('Firebase initialization failed critical:', innerError);
      firebaseApp = getApp(); 
    }
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
