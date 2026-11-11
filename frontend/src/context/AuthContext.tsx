import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'technician' | 'admin';
  phone?: string;
  avatar?: string;
}
function normalizeUser(data: any): User {
  return {
    id: data.id,
    name: data.name ?? data.full_name ?? 'User',
    email: data.email,
    role: data.role,
    phone: data.phone,
    avatar: data.avatar ?? data.avatar_url,
  };
}
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('bf_token');
    const savedUser = localStorage.getItem('bf_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(normalizeUser(JSON.parse(savedUser)));
      } catch { /* ignore */ }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { token: newToken } = res.data;
    const userData = normalizeUser(res.data.user);
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('bf_token', newToken);
    localStorage.setItem('bf_user', JSON.stringify(userData));
  };

  const register = async (data: any) => {
    const res = await authAPI.register(data);
    const { token: newToken } = res.data;
    const userData = normalizeUser(res.data.user);
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('bf_token', newToken);
    localStorage.setItem('bf_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('bf_token');
    localStorage.removeItem('bf_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
