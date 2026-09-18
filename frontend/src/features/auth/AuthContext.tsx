import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: 'guest' | 'buyer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('mp_user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        // Decode JWT to check expiry
        const payloadBase64 = savedToken.split('.')[1];
        if (payloadBase64) {
          const payload = JSON.parse(atob(payloadBase64));
          const isExpired = payload.exp && payload.exp * 1000 < Date.now();
          
          if (isExpired) {
            localStorage.removeItem('mp_user');
            localStorage.removeItem('token');
            setUser(null);
            return;
          }
        }
        
        setUser(JSON.parse(savedUser));
      } catch (e) {
        setUser(null);
        localStorage.removeItem('mp_user');
        localStorage.removeItem('token');
      }
    }

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
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
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