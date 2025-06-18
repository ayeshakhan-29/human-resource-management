'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type User = {
  id: string;
  email: string;
  name: string;
} | null;

type AuthContextType = {
  user: User;
  login: (userData: Omit<NonNullable<User>, 'id'>) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for user in localStorage on initial load
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    }
  }, []);

  const login = (userData: Omit<NonNullable<User>, 'id'>) => {
    const newUser = { ...userData, id: Date.now().toString() };
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(newUser));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  const isAuthenticated = !!user;

  // Protected routes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const protectedRoutes = ['/dashboard'];
    const publicRoutes = ['/login', '/signup'];

    if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
      router.push('/login');
    }

    if (isAuthenticated && publicRoutes.includes(pathname)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
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
