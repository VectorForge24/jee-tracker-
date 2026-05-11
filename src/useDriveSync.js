import { useState, useCallback } from 'react';

// APNA CLIENT ID YAHAN PASTE KAR
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; 
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

export function useDriveSync() {
  const [token, setToken] = useState(() => localStorage.getItem('gdrive_token'));
  const [isSyncing, setIsSyncing] = useState(false);

  const loginWithGoogle = useCallback(() => {
    if (!window.google) {
      alert('⚠️ Google API blocked! Please disable your Ad-Blocker or Brave Shields and refresh the page.');
      return;
    }
    
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          console.error('Google Login Failed:', response);
          return;
        }
        setToken(response.access_token);
        localStorage.setItem('gdrive_token', response.access_token);
        alert('✅ Successfully logged in with Google!');
        loadFromDrive(response.access_token); // Load data immediately on login
      },
    });
    client.requestAccessToken();
  }, []);

  const logoutGoogle = useCallback(() => {
    setToken(null);
    localStorage.removeItem('gdrive_token');
    alert('Logged out from Google Drive sync.');
  }, []);

  // Upload to Drive
  const saveToDrive = async (accessToken) => {
    if (!accessToken) return;
    setIsSyncing(true);
    
    // Gather all tracker data from localStorage
    const dataToSync = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('tracker-')) dataToSync[key] = localStorage.getItem(key);
    }
    
    const fileContent = JSON.stringify(dataToSync);
    const fileMetadata = { name: 'jee_tracker_backup.json', parents: ['appDataFolder'] };

    try {
      // Step 1: Check if file exists
      const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name="jee_tracker_backup.json"', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const searchData = await searchRes.json();
      const fileId = searchData.files && searchData.files.length > 0 ? searchData.files[0].id : null;

      // Step 2: Upload or Update
      const method = fileId ? 'PATCH' : 'POST';
      const url = fileId 
        ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));

      await fetch(url, { method, headers: { Authorization: `Bearer ${accessToken}` }, body: form });
      console.log('☁️ Auto-synced to Google Drive!');
    } catch (err) {
      console.error('Drive Sync Error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Download from Drive
  const loadFromDrive = async (accessToken) => {
    if (!accessToken) return;
    setIsSyncing(true);
    try {
      const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name="jee_tracker_backup.json"', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const searchData = await searchRes.json();
      
      if (searchData.files && searchData.files.length > 0) {
        const fileId = searchData.files[0].id;
        const fileRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const savedData = await fileRes.json();
        
        // Restore data
        Object.keys(savedData).forEach(key => localStorage.setItem(key, savedData[key]));
        window.location.reload(); // Refresh to apply downloaded data
      }
    } catch (err) {
      console.error('Drive Load Error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  return { isLoggedIn: !!token, token, loginWithGoogle, logoutGoogle, saveToDrive, isSyncing };
}