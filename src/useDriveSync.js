import { useState, useCallback, useEffect } from 'react';

const FILE_NAME = 'jee_tracker_backup.json';
// EXACT VERCEL LINK
const REDIRECT_URI = 'https://jee-tracker-ten.vercel.app'; 

export function useDriveSync() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('gdrive_loggedin') === 'true');
  const [token, setToken] = useState(() => localStorage.getItem('gdrive_token') || null);
  const [isSyncing, setIsSyncing] = useState(false);

  // 🚀 CATCH RAW TOKEN FROM URL
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
        
        // Clean the URL
        window.history.replaceState(null, '', window.location.pathname);
        console.log("✅ RAW OAUTH BYPASS SUCCESSFUL!");
      }
    }
  }, []);

  const loginWithGoogle = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      alert("❌ Client ID not found! Check Vercel environment variables.");
      return;
    }

    const scope = encodeURIComponent('https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file');
    
    // 🔥 THE MAGIC BULLET: No libraries, no popups. Raw browser redirection.
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${REDIRECT_URI}&response_type=token&scope=${scope}&prompt=consent`;
    
    window.location.href = authUrl; 
  };

  const logoutGoogle = () => {
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
