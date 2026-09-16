import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  user: any;
  login: (userData: any) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // قراءة اليوزر من الـ LocalStorage عند فتح الموقع
    const savedUser = localStorage.getItem('mp_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = (userData: any) => {
    setUser(userData);
    localStorage.setItem('mp_user', JSON.stringify(userData));
    localStorage.setItem('mp_token', 'mock_token_123');
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mp_user');
    localStorage.removeItem('mp_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}