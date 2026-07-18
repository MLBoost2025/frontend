"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  AuthSession,
  LoginPayload,
  SignupPayload,
  UpdateProfileInput,
  User,
} from "@/types";

interface AuthContextValue {
  user: User | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  signup: (payload: SignupPayload) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { getCurrentSession } = await import("@/lib/api");
      const currentSession = await getCurrentSession();
      setSession(currentSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const { loginUser } = await import("@/lib/api");
      const newSession = await loginUser(payload);
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    setIsLoading(true);
    try {
      const { signupUser } = await import("@/lib/api");
      const newSession = await signupUser(payload);
      setSession(newSession);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const { logoutUser } = await import("@/lib/api");
      await logoutUser();
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput) => {
    const { updateUserProfile } = await import("@/lib/api");
    const user = await updateUserProfile(input);
    setSession((current) => (current ? { ...current, user } : current));
    return user;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      isAuthenticated: Boolean(session?.user),
      isAdmin: Boolean(session?.user?.roles?.includes("Admin")),
      isLoading,
      login,
      signup,
      logout,
      refreshSession,
      updateProfile,
    }),
    [session, isLoading, login, signup, logout, refreshSession, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }
  return context;
}
