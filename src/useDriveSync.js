/**
 * useFirebaseSync — drop-in replacement for useDriveSync.
 * 
 * Returns EXACTLY the same API shape as the original useDriveSync:
 *   { isLoggedIn, token, loginWithGoogle, logoutGoogle, saveToDrive, isSyncing }
 * 
 * App.jsx needs ZERO changes — every call site works identically.
 * 
 * What changed internally:
 * - Auth: Firebase Google popup (permanent, never expires, auto-refreshes)
 * - Storage: Firestore at users/{uid}/data/trackerData
 * - saveToDrive(token) still called the same way — token param ignored (not needed)
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

// ── Firebase config from env vars ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Only initialise once (Vite HMR safe)
const firebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth        = getAuth(firebaseApp);
const db          = getFirestore(firebaseApp);

// All localStorage keys that belong to the tracker
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

export function useDriveSync() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token,      setToken]      = useState(null); // uid — truthy = logged in
  const [isSyncing,  setIsSyncing]  = useState(false);
  const hasPulled    = useRef(false);

  // ── Auth state listener — fires on every load, handles silent token refresh ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsLoggedIn(true);
        setToken(user.uid);

        // Pull from Firestore once per session (not on every re-render)
        if (!hasPulled.current) {
          hasPulled.current = true;
          await pullFromFirestore(user.uid);
        }
      } else {
        setIsLoggedIn(false);
        setToken(null);
        hasPulled.current = false;
      }
    });
    return unsub;
  }, []);

  // ── Pull Firestore → localStorage on login ────────────────────────────────
  const pullFromFirestore = async (uid) => {
    try {
      setIsSyncing(true);
      const snap = await getDoc(doc(db, 'users', uid, 'data', 'trackerData'));
      if (!snap.exists()) {
        console.log('ℹ️ No cloud data yet — starting fresh');
        return;
      }

      const remote     = snap.data();
      let   hasChanges = false;

      TRACKER_KEYS.forEach(key => {
        if (remote[key] !== undefined && localStorage.getItem(key) !== remote[key]) {
          localStorage.setItem(key, remote[key]);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        console.log('✅ Cloud data restored — reloading');
        window.location.reload();
      } else {
        console.log('✅ Already in sync with cloud');
      }
    } catch (e) {
      console.error('Pull error:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  // ── Push localStorage → Firestore ─────────────────────────────────────────
  // saveToDrive(token) — token param accepted but not used (Firebase uses currentUser)
  const saveToDrive = useCallback(async (_tokenIgnored) => {
    const user = auth.currentUser;
    if (!user) return; // Not logged in, silently skip

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
      console.log('✅ Saved to Firebase');
    } catch (e) {
      console.error('Save error:', e);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // ── Login via popup — no redirect, no token expiry ────────────────────────
  const loginWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    try {
      await signInWithPopup(auth, provider);
      // onAuthStateChanged fires automatically → pulls data
    } catch (e) {
      if (e.code !== 'auth/popup-closed-by-user') {
        console.error('Login error:', e.message);
        alert('Sign-in failed: ' + e.message);
      }
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logoutGoogle = useCallback(async () => {
    await signOut(auth);
    hasPulled.current = false;
  }, []);

  // Return same shape as original useDriveSync — App.jsx unchanged
  return {
    isLoggedIn,
    token,
    loginWithGoogle,
    logoutGoogle,
    saveToDrive,
    isSyncing,
    sessionExpired: false, // Firebase never expires — always false
  };
}
