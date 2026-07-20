// lib/firebaseAdmin.ts
// Firebase Admin SDK — server side only (API routes)
// Uses firebase-admin package

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getFirestore, Firestore }            from "firebase-admin/firestore";
import { getAuth, Auth }                      from "firebase-admin/auth";

let app: App;

function initAdmin(): App {
  if (getApps().length > 0) return getApps()[0];

  return initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_ADMIN_PROJECT_ID   || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL || "",
      privateKey:  (process.env.FIREBASE_ADMIN_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

export const adminApp:  App       = initAdmin();
export const db:        Firestore = getFirestore(adminApp);
export const adminAuth: Auth      = getAuth(adminApp);
export default adminApp;
