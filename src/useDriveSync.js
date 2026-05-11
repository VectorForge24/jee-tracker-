import { useState, useCallback, useEffect } from 'react';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';

const FILE_NAME = 'jee_tracker_backup.json';

export function useDriveSync() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('gdrive_loggedin') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('gdrive_token') || null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 🚀 THE MAGIC: Catching the token from URL when Google redirects back!
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token=')) {
      const params = new URLSearchParams(hash.replace('#', '?'));
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        setToken(accessToken);
        setIsLoggedIn(true);
        localStorage.setItem('gdrive_token', accessToken);
        localStorage.setItem('gdrive_loggedin', 'true');
        
        // Clean up the URL so it looks normal again
        window.history.replaceState(null, '', window.location.pathname);
        console.log("✅ Token grabbed successfully without any popup!");
      }
    }
  }, []);

  const loginWithGoogle = useGoogleLogin({
    // POPUPS ARE DEAD. We redirect the whole page now.
    ux_mode: 'redirect', 
    scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
  });

  const logoutGoogle = () => {
    googleLogout();
    setIsLoggedIn(false);
    setToken(null);
    localStorage.removeItem('gdrive_token');
    localStorage.removeItem('gdrive_loggedin');
    console.log("Logged out of Google Drive.");
  };

  const saveToDrive = useCallback(async (accessToken) => {
    if (!accessToken) return;
    setIsSyncing(true);

    try {
      const dataToSave = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('tracker-')) dataToSave[key] = localStorage.getItem(key);
      }
      
      const fileContent = JSON.stringify(dataToSave);
      const metadata = { name: FILE_NAME, parents: ['appDataFolder'] };

      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const searchData = await searchRes.json();
      let fileId = null;
      
      if (searchData.files && searchData.files.length > 0) {
        fileId = searchData.files[0].id;
      }

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      const url = fileId 
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      
      const method = fileId ? 'PATCH' : 'POST';

      const uploadRes = await fetch(url, {
        method: method,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });

      if (uploadRes.ok) console.log("✅ Data successfully synced to Google Drive!");
    } catch (error) {
      console.error("❌ Drive Sync Catch Error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isLoggedIn, token, loginWithGoogle, logoutGoogle, saveToDrive, isSyncing };
}
