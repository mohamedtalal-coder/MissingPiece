import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'guest' | 'buyer' | 'admin';
  isEmailVerified?: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('mp_user');
      const savedToken = localStorage.getItem('token');

      if (savedUser && savedToken) {
        // Decode JWT to check expiry
        const payloadBase64 = savedToken.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          const isExpired = payload.exp && payload.exp * 1000 < Date.now();

          if (isExpired) {
            localStorage.removeItem('mp_user');
            localStorage.removeItem('token');
          } else {
            setUser(JSON.parse(savedUser));
          }
        } else {
          localStorage.removeItem('mp_user');
          localStorage.removeItem('token');
        }
      }
    } catch {
        localStorage.removeItem('mp_user');
        localStorage.removeItem('token');
    }

    setIsLoading(false);

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token' && !e.newValue) {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (token: string, userData: User) => {
    setUser(userData);
    localStorage.setItem('mp_user', JSON.stringify(userData));
    localStorage.setItem('token', token); // نفس المفتاح اللي بيقرأه client.ts
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem('mp_user', JSON.stringify(next));
      return next;
    });
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('mp_user');
    localStorage.removeItem('token');
    // We import authApi locally to avoid circular dependencies if authApi imports apiClient which uses token
    import('./authApi').then(({ authApi }) => {
      authApi.logout().catch(console.error);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
      }}
    >
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