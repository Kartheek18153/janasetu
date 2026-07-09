import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from 'react';
import { UserProfile } from '../types';
import { auth } from '../firebase/config';
import { AuthService } from '../services';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCitizen: boolean;
  isVerified: boolean;
  isPhoneVerified: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (data: { email: string; password: string; name: string; phone?: string }) => Promise<UserProfile>;
  loginWithGoogle: () => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setVerificationPending: (v: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const pendingLoginRef = useRef(false);
  const verificationPendingRef = useRef(false);
  const profileLoadAttempted = useRef(false);

  const setVerificationPending = (v: boolean) => { verificationPendingRef.current = v; };

  const loadProfile = useCallback(async (uid: string): Promise<boolean> => {
    const profile = await AuthService.getCurrentUser();
    if (profile) {
      setUser(profile);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (cancelled) return;
      if (pendingLoginRef.current) return;
      if (verificationPendingRef.current) return;

      if (firebaseUser) {
        await firebaseUser.reload();

        const loaded = await loadProfile(firebaseUser.uid);
        if (loaded) {
          profileLoadAttempted.current = true;
          setLoading(false);
          return;
        }

        // Retry with backoff if profile not yet created (race with registration)
        if (!profileLoadAttempted.current && retryCount < MAX_RETRIES) {
          retryCount++;
          await new Promise(r => setTimeout(r, retryCount * 1000));
          if (!cancelled) {
            await loadProfile(firebaseUser.uid);
          }
        }
        profileLoadAttempted.current = true;
        setLoading(false);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => { cancelled = true; unsubscribe(); };
  }, [loadProfile]);

  const login = async (email: string, password: string) => {
    pendingLoginRef.current = true;
    try {
      const u = await AuthService.login(email, password);
      setUser(u);
      return u;
    } finally {
      pendingLoginRef.current = false;
    }
  };

  const loginWithGoogle = async () => {
    pendingLoginRef.current = true;
    try {
      const u = await AuthService.loginWithGoogle();
      setUser(u);
      return u;
    } finally {
      pendingLoginRef.current = false;
    }
  };

  const register = async (data: { email: string; password: string; name: string; phone?: string }) => {
    pendingLoginRef.current = true;
    try {
      const u = await AuthService.register(data);
      return u;
    } finally {
      pendingLoginRef.current = false;
    }
  };

  const logout = async () => {
    await AuthService.logout();
    setUser(null);
  };

  const refreshProfile = async () => {
    const profile = await AuthService.getCurrentUser();
    if (profile) setUser(profile);
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user && (user.role === 'admin' || user.isVerified),
    isAdmin: user?.role === 'admin',
    isCitizen: user?.role === 'citizen',
    isVerified: user?.isVerified ?? false,
    isPhoneVerified: user?.isPhoneVerified ?? false,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshProfile,
    setVerificationPending,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;