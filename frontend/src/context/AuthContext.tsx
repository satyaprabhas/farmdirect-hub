import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setToken, removeToken, setUser, removeUser, getToken, getUser } from '../api/client';

interface User {
  id: number;
  full_name: string;
  username: string;
  mobile_number: string;
  role: 'FARMER' | 'CONSUMER' | 'COORDINATOR' | 'ADMIN' | 'ADVISER' | 'LARGE_SCALE_CONSUMER';
  email?: string;
  address?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  is_verified?: number;
  is_active?: number;
  farm_name?: string;
  farm_type?: string;
  specialization?: string;
  qualification?: string;
  license_number?: string;
  experience_years?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, role: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.user) {
        setUserState(res.data.user);
        setUser(res.data.user);
      }
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  useEffect(() => {
    const savedToken = getToken();
    const savedUser = getUser();
    if (savedToken && savedUser) {
      setTokenState(savedToken);
      setUserState(savedUser);
      // Validate token
      api.get('/auth/me')
        .then((res) => {
          setUserState(res.data.user);
          setUser(res.data.user);
        })
        .catch(() => {
          removeToken();
          removeUser();
          setTokenState(null);
          setUserState(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string, role: string) => {
    const response = await api.post('/auth/login', { username, password, role });
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    setTokenState(newToken);
    setUserState(newUser);
  };

  const register = async (data: any) => {
    await api.post('/auth/register', data);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
