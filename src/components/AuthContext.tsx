import React, { useContext, createContext, useState, useEffect, ReactNode } from 'react';
import supabase from '../config/supabaseClient';
import { AuthError, Session, User } from '@supabase/supabase-js';

export interface AuthContextData {
  isLoggedIn: boolean;
  userId: string | null;
  username: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}


export interface AuthResponse {
  user: User | null;
  session: Session | null;
}


const initialAuthContextData: AuthContextData = {
  isLoggedIn: false,
  userId: null,
  username: null,
  signIn: async (email, password) => {},
  signOut: () => {},
};





interface AuthProviderProps {
  children: ReactNode;
}

export const AuthContext = createContext<AuthContextData>(initialAuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedUserId = localStorage.getItem('userId');

    if (storedUsername && storedUserId) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserId(storedUserId);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw new Error('Invalid credentials');
      }

      const user = data?.user;

      if (user) {
        setIsLoggedIn(true);
        setUserId(user.id);
        setUsername(user.email || null);
        localStorage.setItem('userId', user.id);
        localStorage.setItem('username', user.email || '');
      }
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      // Handle error, show a message to the user
    } else {
      setIsLoggedIn(false);
      setUserId(null);
      setUsername(null);
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
    }
  };

  const authContextData: AuthContextData = {
    isLoggedIn,
    userId,
    username,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={authContextData}>{children}</AuthContext.Provider>;
};


export function useAuth(): AuthContextData {
  return useContext(AuthContext);
}