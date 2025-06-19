'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserRole = 'admin' | 'employee';

type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
} | null;

interface AuthContextType {
  user: User;
  login: (userData: { email: string; name: string }, role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (userData: { email: string; name: string }, role: UserRole) => {
    const newUser = { 
      ...userData, 
      id: Date.now().toString(),
      role 
    };
    
    // Update state and localStorage
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Redirect to appropriate dashboard based on role
    const redirectPath = role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
    window.location.href = redirectPath;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
