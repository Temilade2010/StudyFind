import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const DEFAULT_GUEST_USER = {
  id: 'guest_student',
  full_name: 'Student Scholar',
  role: 'student',
  institution: 'Open Academic Network',
  academic_level: 'undergraduate',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  is_verified: true
};

export const AuthProvider = ({ children }) => {
  // Always default to an authorized student guest so there are zero login roadblocks
  const [user, setUser] = useState(DEFAULT_GUEST_USER);
  const [savedShelf, setSavedShelf] = useState([]);
  const [recentlyDownloaded, setRecentlyDownloaded] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load saved shelf and downloads from localStorage on startup
  useEffect(() => {
    try {
      const storedShelf = localStorage.getItem('studyfind_saved_shelf');
      if (storedShelf) {
        setSavedShelf(JSON.parse(storedShelf));
      }
      const storedDownloads = localStorage.getItem('studyfind_recent_downloads');
      if (storedDownloads) {
        setRecentlyDownloaded(JSON.parse(storedDownloads));
      }
    } catch (e) {
      console.warn('Could not read saved shelf from localStorage:', e);
    }
  }, []);

  // Save to shelf toggle
  const toggleSave = (resource) => {
    if (!resource || !resource.id) return false;
    setSavedShelf(prev => {
      const exists = prev.some(item => item.id === resource.id);
      let updated;
      if (exists) {
        updated = prev.filter(item => item.id !== resource.id);
      } else {
        updated = [resource, ...prev];
      }
      try {
        localStorage.setItem('studyfind_saved_shelf', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
      return updated;
    });
    return true;
  };

  const isSaved = (resourceId) => {
    return savedShelf.some(item => item.id === resourceId);
  };

  const removeSavedItem = (resourceId) => {
    setSavedShelf(prev => {
      const updated = prev.filter(item => item.id !== resourceId);
      localStorage.setItem('studyfind_saved_shelf', JSON.stringify(updated));
      return updated;
    });
  };

  const clearShelf = () => {
    setSavedShelf([]);
    localStorage.removeItem('studyfind_saved_shelf');
  };

  // Record a PDF download into recent downloads
  const trackDownload = (resource) => {
    if (!resource || !resource.id) return;
    setRecentlyDownloaded(prev => {
      const filtered = prev.filter(item => item.id !== resource.id);
      const updated = [
        { ...resource, downloadedAt: new Date().toISOString() },
        ...filtered
      ].slice(0, 20);
      try {
        localStorage.setItem('studyfind_recent_downloads', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const shelfCount = savedShelf.length;
  const libraryCount = shelfCount;

  // Compatibility helpers
  const login = async () => DEFAULT_GUEST_USER;
  const signup = async () => DEFAULT_GUEST_USER;
  const logout = () => {
    clearShelf();
  };
  const refreshLibraryCount = () => {};

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      savedShelf,
      recentlyDownloaded,
      shelfCount,
      libraryCount,
      isSaved,
      toggleSave,
      removeSavedItem,
      clearShelf,
      trackDownload,
      refreshLibraryCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
