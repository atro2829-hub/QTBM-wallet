
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * تهيئة Firebase بشكل آمن لبيئة الأندرويد والتصدير الثابت.
 * تم تعديل المنطق لضمان عدم الانهيار أثناء مرحلة البناء (Build-time).
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null
    };
  }

  if (getApps().length > 0) {
    return getSdks(getApp());
  }

  let firebaseApp: FirebaseApp;
  
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (e) {
    firebaseApp = getApp();
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
