import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'OWNER' | 'ADMIN' | 'TECHNICIAN' | 'VIEWER';
  organizationId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  signup: (data: { name: string; email: string; password: string; orgName: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'serviceflow_auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Demo accounts
    const demoAccounts: Record<string, AuthUser> = {
      'admin@climatech.pt': {
        id: 'user_1',
        email: 'admin@climatech.pt',
        name: 'Admin ClimaTech',
        role: 'OWNER',
        organizationId: 'org_1',
      },
      'carlos@climatech.pt': {
        id: 'user_2',
        email: 'carlos@climatech.pt',
        name: 'Carlos Técnico',
        role: 'TECHNICIAN',
        organizationId: 'org_1',
      },
    };

    if (demoAccounts[normalizedEmail] && password === 'demo123') {
      setUser(demoAccounts[normalizedEmail]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(demoAccounts[normalizedEmail]));
      setIsLoading(false);
      return { success: true };
    }

    // Any other email works with password 'demo123' (simulates signup)
    if (password === 'demo123' && normalizedEmail.includes('@')) {
      const newUser: AuthUser = {
        id: 'user_' + Math.random().toString(36).slice(2, 8),
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        role: 'OWNER',
        organizationId: 'org_' + Math.random().toString(36).slice(2, 8),
      };
      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: 'Credenciais inválidas. Use qualquer email com password "demo123"' };
  };

  const signup = async (data: { name: string; email: string; password: string; orgName: string }) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1000));

    const newUser: AuthUser = {
      id: 'user_' + Math.random().toString(36).slice(2, 8),
      email: data.email,
      name: data.name,
      role: 'OWNER',
      organizationId: 'org_' + Math.random().toString(36).slice(2, 8),
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setIsLoading(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, signup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
