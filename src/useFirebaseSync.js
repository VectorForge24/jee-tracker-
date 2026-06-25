/**
 * useFirebaseSync — replaces useDriveSync entirely.
 *
 * Firebase handles:
 * - Google Auth with PERMANENT sessions (never expires, auto-refreshes silently)
 * - Firestore stores tracker data per student at users/{uid}/trackerData
 * - Any change → debounced write to Firestore (2.5s after last change)
 * - New device login → pulls their data from Firestore instantly
 *
 * Drop-in replacement: same API as useDriveSync
 *   { isLoggedIn, token, uid, loginWithGoogle, logoutGoogle, saveToDrive→saveToFirebase, isSyncing }
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';

// ── Firebase config — filled from env vars ────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Init once
const app  = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);

// Keys saved to Firestore (same keys used in localStorage)
const TRACKER_KEYS = [
  'tracker-events',
  'tracker-chapters',
  'tracker-syllabus',
  'tracker-mocks',
  'tracker-materials',
  'tracker-theme',
  'tracker-color',
  'tracker-color-intensity',
  'tracker-bg-dimness',
  'tracker-tile-opacity',
  'tracker-bg',
];

export function useFirebaseSync() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [uid,        setUid]        = useState(null);
  const [isSyncing,  setIsSyncing]  = useState(false);
  const [userInfo,   setUserInfo]   = useState(null); // { name, email, photoURL }

  // ── Auth state listener — fires on load, handles token refresh silently ────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setUid(user.uid);
        setUserInfo({
          name:     user.displayName,
          email:    user.email,
          photoURL: user.photoURL,
        });
        // Pull their data from Firestore into localStorage on login
        await pullFromFirestore(user.uid);
      } else {
        setIsLoggedIn(false);
        setUid(null);
        setUserInfo(null);
      }
    });
    return unsub;
  }, []);

  // ── Pull Firestore → localStorage ─────────────────────────────────────────
  const pullFromFirestore = async (userId) => {
    try {
      setIsSyncing(true);
      const ref  = doc(db, 'users', userId, 'data', 'trackerData');
      const snap = await getDoc(ref);
      if (!snap.exists()) return; // First time user, nothing to pull

      const remote = snap.data();
      let hasChanges = false;

      TRACKER_KEYS.forEach(key => {
        if (remote[key] !== undefined && localStorage.getItem(key) !== remote[key]) {
          localStorage.setItem(key, remote[key]);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        // Reload so all components pick up new localStorage values
        window.location.reload();
      }
    } catch (e) {
      console.error('Firestore pull error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // ── Push localStorage → Firestore ─────────────────────────────────────────
  // This is the replacement for saveToDrive — same call site, no token param needed
  const saveToFirebase = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) return;

    setIsSyncing(true);
    try {
      const data = {};
      TRACKER_KEYS.forEach(key => {
        const val = localStorage.getItem(key);
        if (val !== null) data[key] = val;
      });

      await setDoc(
        doc(db, 'users', user.uid, 'data', 'trackerData'),
        { ...data, _updatedAt: serverTimestamp() },
        { merge: true }
      );
      console.log('✅ Saved to Firestore');
    } catch (e) {
      console.error('Firestore save error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // ── Google sign-in via popup (no page redirect, no token expiry) ──────────
  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged fires automatically → pulls data
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        console.error('Sign-in error:', e);
        alert('Sign-in failed. Please try again.');
      }
    }
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logoutGoogle = useCallback(async () => {
    await signOut(auth);
    // Don't clear localStorage — keep data for offline use
  }, []);

  // ── Backward-compat shim so App.jsx triggerSync works unchanged ────────────
  // App.jsx calls: saveToDrive(token) — we ignore the token param
  const saveToDrive = useCallback(() => saveToFirebase(), [saveToFirebase]);

  return {
    isLoggedIn,
    uid,
    userInfo,
    token: uid, // App.jsx checks `token` truthy — uid serves the same purpose
    loginWithGoogle,
    logoutGoogle,
    saveToDrive,      // ← same name, App.jsx unchanged
    saveToFirebase,
    isSyncing,
  };
}
