"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { User } from "@/types";
import { DEMO_USERS, DEMO_CREDENTIALS, validateIDLCLogin } from "@/lib/data/demo-users";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isApprover: boolean;
  isProposer: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "cec_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
    finally { setIsLoading(false); }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const em = email.trim().toLowerCase();

    // 1. Demo accounts
    const demoCred = DEMO_CREDENTIALS.find(
      (c) => c.email.toLowerCase() === em && c.password === password
    );
    if (demoCred) {
      const found = DEMO_USERS.find((u) => u.email.toLowerCase() === em)!;
      const authed = { ...found, last_login: new Date().toISOString() };
      setUser(authed);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(authed));
      return { success: true };
    }

    // 2. IDLC @idlc.com + 6-digit CIF
    const idlcUser = validateIDLCLogin(em, password);
    if (idlcUser) {
      setUser(idlcUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(idlcUser));
      return { success: true };
    }

    // 3. Validate @idlc.com format specifically to give helpful error
    if (em.endsWith("@idlc.com") && !/^\d{6}$/.test(password)) {
      return { success: false, error: "IDLC login requires your 6-digit Employee CIF as password." };
    }

    return { success: false, error: "Invalid credentials. Use your IDLC email + CIF, or a demo account." };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      isAdmin: user?.role === "admin",
      isApprover: user?.role === "approver",
      isProposer: user?.role === "proposer",
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
