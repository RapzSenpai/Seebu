import React, { createContext, useContext, useState, useEffect } from 'react';

import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './providers/AuthProvider';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState('user');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // ponytail: reloadable so profile edits propagate app-wide instead of
  // going stale until next login.
  const refresh = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      const stored = snap.exists() ? snap.data() : null;
      const resolvedRole = stored?.role || 'user';

      setRole(resolvedRole);
      // Expose the stored user document (interests, avatar, notification
      // preference, ...) so screens can render real data instead of
      // hardcoded placeholders.
      setProfile({
        ...(stored || {}),
        uid: user.uid,
        email: user.email,
        role: resolvedRole,
      });
    } catch {
      // Keep last good snapshot on transient failures.
    }
  };

  useEffect(() => {
    if (!user) {
      setRole('user');
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [user?.uid]);

  return (
    <UserContext.Provider value={{ role, isAdmin: role === 'admin', profile, loading, refresh }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
