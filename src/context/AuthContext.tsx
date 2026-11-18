import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  deductLocalCredits,
  getActiveUser,
  loginOrSignUpLocal,
  logoutLocal,
} from '../lib/localStudioApi';
import { DbUserProfile } from '../types/studio';

interface AuthContextValue {
  user: DbUserProfile | null;
  dbUser: DbUserProfile | null;
  loading: boolean;
  authError: string | null;
  signInWithEmail: (email: string, displayName?: string) => Promise<void>;
  signInAsDemo: () => Promise<void>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateLocalCredits: (credits: number) => void;
  spendCredits: (amount: number) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DbUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const active = getActiveUser();
      setUser(active);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = useCallback(
    async (email: string, displayName?: string) => {
      setAuthError(null);
      if (!email.trim() || !email.includes('@')) {
        setAuthError('Please enter a valid email address.');
        return;
      }
      const profile = loginOrSignUpLocal({ email, displayName });
      setUser(profile);
    },
    []
  );

  const signInAsDemo = useCallback(async () => {
    setAuthError(null);
    const profile = loginOrSignUpLocal({
      email: 'creator@nova.ai',
      displayName: 'Nova Creator',
    });
    setUser(profile);
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    logoutLocal();
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const active = getActiveUser();
    setUser(active);
  }, []);

  const updateLocalCredits = useCallback((credits: number) => {
    setUser((prev) => (prev ? { ...prev, credits } : prev));
  }, []);

  const spendCredits = useCallback(
    (amount: number) => {
      if (!user) return false;
      if (user.credits < amount) return false;
      const updated = deductLocalCredits(user.email, amount);
      if (updated) {
        setUser(updated);
      }
      return true;
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser: user,
        loading,
        authError,
        signInWithEmail,
        signInAsDemo,
        signOutUser,
        refreshProfile,
        updateLocalCredits,
        spendCredits,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
