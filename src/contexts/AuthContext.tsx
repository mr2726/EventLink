
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, pass: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthForm: boolean; // New state
  setShowAuthForm: (show: boolean) => void; // New setter
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'eventlink_users';
const SESSION_STORAGE_KEY = 'eventlink_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthForm, setShowAuthForm] = useState(false); // Initialize here
  const router = useRouter();
  const { toast } = useToast();

  const getStoredUsers = (): Record<string, string> => {
    if (typeof window === 'undefined') return {};
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : {};
  };

  const storeUser = (username: string, pass: string) => {
    if (typeof window === 'undefined') return;
    const users = getStoredUsers();
    users[username] = pass; // In a real app, hash the password
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionUser = localStorage.getItem(SESSION_STORAGE_KEY);
      if (sessionUser) {
        try {
          setUser(JSON.parse(sessionUser));
          setShowAuthForm(false); // If user is loaded from session, don't show auth form initially
        } catch (e) {
          console.error("Failed to parse session user:", e);
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    // Special admin login
    if (username === 'admin' && pass === 'admin') {
      const adminUser: User = { id: 'admin-user', username: 'admin' };
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminUser));
      }
      toast({ title: "Login Successful", description: "Welcome, Admin!" });
      setShowAuthForm(false); // Hide auth form on successful login
      setIsLoading(false);
      router.push('/'); 
      return true;
    }

    const storedUsers = getStoredUsers();
    if (storedUsers[username] && storedUsers[username] === pass) {
      const regularUser: User = { id: username, username };
      setUser(regularUser);
       if (typeof window !== 'undefined') {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(regularUser));
      }
      toast({ title: "Login Successful", description: `Welcome back, ${username}!` });
      setShowAuthForm(false); // Hide auth form on successful login
      setIsLoading(false);
      router.push('/');
      return true;
    }

    toast({ title: "Login Failed", description: "Invalid username or password.", variant: "destructive" });
    setIsLoading(false);
    return false;
  }, [router, toast]);

  const register = useCallback(async (username: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    const storedUsers = getStoredUsers();
    if (storedUsers[username]) {
      toast({ title: "Registration Failed", description: "Username already exists.", variant: "destructive" });
      setIsLoading(false);
      return false;
    }

    storeUser(username, pass); 
    const newUser: User = { id: username, username };
    setUser(newUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
    }
    toast({ title: "Registration Successful", description: `Welcome, ${username}! You are now logged in.` });
    setShowAuthForm(false); // Hide auth form on successful registration
    setIsLoading(false);
    router.push('/');
    return true;
  }, [router, toast]);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
    setShowAuthForm(false); // Reset to show landing page content after logout
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    router.push('/');
  }, [router, toast]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, register, isAuthenticated, isLoading, showAuthForm, setShowAuthForm }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
