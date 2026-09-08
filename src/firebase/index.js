/**
 * firebase/index.js
 *
 * Initializes the Firebase app + exports the SDK instances used
 * throughout SOrders (Auth + Firestore).
 *
 * All config values come from Vite env vars (see .env.example).
 * Never hardcode real project credentials here.
 */
import { getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  // Fails loudly in dev instead of silently hitting a dead backend.
  console.warn(
    '[firebase] Missing VITE_FIREBASE_* env vars. Copy .env.example to .env.local '
    + 'and fill in your Firebase project config.',
  )
}

export const firebaseApp = getApps().length > 0
  ? getApps()[0]
  : initializeApp(firebaseConfig)

export const auth = getAuth(firebaseApp)

// Offline persistence makes the kitchen/server boards resilient to flaky
// wifi in a restaurant, and lets the customer menu keep working briefly
// on reconnect.
function createFirestore () {
  try {
    return initializeFirestore(firebaseApp, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  } catch {
    // Falls back to the default (memory) cache, e.g. in SSR or if a second
    // Firestore instance was already initialized elsewhere.
    return getFirestore(firebaseApp)
  }
}
export const db = createFirestore()

/**
 * A *second*, independent Firebase App instance.
 *
 * Firebase's client Auth SDK has one signed-in user per App instance. When
 * Admin creates a new staff account with createUserWithEmailAndPassword,
 * that call signs the *new* user into whichever app instance issued it —
 * which would otherwise kick the Admin out of their own session. Running
 * account creation through this isolated instance keeps the Admin's
 * session untouched. See src/stores/auth.js `createStaffAccount`.
 */
export function getSecondaryAuth () {
  const secondaryApp = getApps().find(a => a.name === 'secondary')
    ?? initializeApp(firebaseConfig, 'secondary')
  return getAuth(secondaryApp)
}
