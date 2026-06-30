import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  loginGuest: (name: string) => void;
  logout: () => Promise<void>;
  supabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          setIsGuest(false);
        } else {
          // Check if guest info exists in localStorage
          loadLocalGuest();
        }
        setLoading(false);
      });

      // 2. Listen for auth state shifts
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          setUser(session.user);
          setIsGuest(false);
        } else {
          setUser(null);
          loadLocalGuest();
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    } else {
      // Supabase is not configured, fall back to Local Storage Guest
      loadLocalGuest();
      setLoading(false);
    }
  }, []);

  const loadLocalGuest = () => {
    const savedGuest = localStorage.getItem('aira_guest_user');
    if (savedGuest) {
      try {
        const guestData = JSON.parse(savedGuest);
        setUser(guestData);
        setIsGuest(true);
      } catch {
        setUser(null);
        setIsGuest(false);
      }
    } else {
      setUser(null);
      setIsGuest(false);
    }
  };

  const loginGuest = (name: string) => {
    const guestUser: any = {
      id: 'guest_user_' + Math.random().toString(36).substring(2, 9),
      email: 'guest@aira.ai',
      user_metadata: {
        full_name: name || 'Companion',
      },
      created_at: new Date().toISOString(),
    };
    localStorage.setItem('aira_guest_user', JSON.stringify(guestUser));
    setUser(guestUser);
    setIsGuest(true);
  };

  const logout = async () => {
    setLoading(true);
    if (isSupabaseConfigured && supabase && !isGuest) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('aira_guest_user');
    setUser(null);
    setIsGuest(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isGuest,
        loginGuest,
        logout,
        supabaseConfigured: isSupabaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
