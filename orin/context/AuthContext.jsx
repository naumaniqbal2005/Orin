import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../lib/auth';
import { userService } from '../lib/user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const ensureProfile = useCallback(async (currentUser) => {
    try {
      await userService.get();
      setProfileError(null);
    } catch (error) {
      setProfileError(error.message);
      console.error('Profile initialization failed:', error.message);
    }
    return currentUser;
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      await ensureProfile(currentUser);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [ensureProfile]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email, password) => {
      await authService.login(email, password);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      await ensureProfile(currentUser);
      return currentUser;
    },
    [ensureProfile],
  );

  const register = useCallback(
    async (email, password, name) => {
      const newUser = await authService.register(email, password, name);
      setUser(newUser);
      await ensureProfile(newUser);
      return newUser;
    },
    [ensureProfile],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setProfileError(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, profileError, login, register, logout, refreshUser }),
    [user, loading, profileError, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
