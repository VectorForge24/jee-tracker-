import { useState, useCallback, useEffect } from 'react';

const FILE_NAME = 'jee_tracker_backup.json';
const REDIRECT_URI = 'https://jee-tracker-ten.vercel.app'; 

export function useDriveSync() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('gdrive_loggedin') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('gdrive_token') || null);
  const [isSyncing, setIsSyncing] = useState(false);

  const logoutGoogle = useCallback(() => {
    setIsLoggedIn(false);
    setToken(null);
    localStorage.removeItem('gdrive_token');
    localStorage.removeItem('gdrive_loggedin');
    console.log("Logged out of Google Drive.");
  }, []);

  // 📥 Download logic
  const fetchDataFromDrive = useCallback(async (accessToken) => {
    setIsSyncing(true);
    try {
      const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'&fields=files(id)`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Handle expired token
      if (searchRes.status === 401) {
        logoutGoogle();
        alert("⚠️ Google Drive session expired. Please reconnect to sync your data.");
        return;
      }

      const searchData = await searchRes.json();

      if (searchData.files && searchData.files.length > 0) {
        const fileId = searchData.files[0].id;
        
        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        const backupData = await fileRes.json();
        let hasChanges = false;
        
        // Temporarily bypass the App.jsx auto-sync patch by fetching the true native method 
        // to prevent an accidental upload trigger during the download process.
        const nativeSetItem = Object.getPrototypeOf(window.localStorage).setItem;

        Object.keys(backupData).forEach(key => {
            if (localStorage.getItem(key) !== backupData[key]) {
                nativeSetItem.call(localStorage, key, backupData[key]);
                hasChanges = true;
            }
        });

        if (hasChanges) {
           alert("✅ Cloud Sync Complete! Restoring your Command Center...");
           window.location.reload(); 
        } else {
           console.log("✅ Drive Data is already in sync with local.");
        }
      }
    } catch (e) {
       console.error("❌ Fetch Error:", e);
    } finally {
      setIsSyncing(false);
    }
  }, [logoutGoogle]);

  // 🚀 Catch token from URL + Auto Restore
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
        
        window.history.replaceState(null, '', window.location.pathname);
        console.log("✅ RAW OAUTH BYPASS SUCCESSFUL!");
        
        fetchDataFromDrive(accessToken);
      }
    }
  }, [fetchDataFromDrive]);

  const loginWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert("❌ Client ID not found! Check Vercel environment variables.");
      return;
    }
    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${scope}&prompt=consent`;
    
    window.location.href = authUrl; 
  };

  // 📤 Upload Logic 
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
      
      // Handle expired token on upload
      if (searchRes.status === 401) {
        logoutGoogle();
        alert("⚠️ Google Drive session expired. Please reconnect to backup your data.");
        setIsSyncing(false);
        return;
      }

      const searchData = await searchRes.json();
      
      let fileId = null;
      if (searchData.files && searchData.files.length > 0) fileId = searchData.files[0].id;

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

      if (!uploadRes.ok && uploadRes.status === 401) {
         logoutGoogle();
         alert("⚠️ Google Drive session expired during upload. Please reconnect.");
      } else if (uploadRes.ok) {
         console.log("✅ Data successfully synced to Google Drive!");
      }
    } catch (error) {
      console.error("❌ Drive Sync Catch Error:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [logoutGoogle]);

  return { isLoggedIn, token, loginWithGoogle, logoutGoogle, saveToDrive, fetchDataFromDrive, isSyncing };
}
