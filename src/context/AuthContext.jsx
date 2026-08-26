import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Check if URL contains type=recovery
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setIsRecoveryMode(true);
      setIsAuthModalOpen(true);
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecoveryMode(true);
        setIsAuthModalOpen(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up with email, password, and full name
  const signUp = async (email, password, fullName) => {
    if (!supabase) throw new Error('Supabase is not configured yet');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    // Create profile entry if user was created
    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Profile creation non-blocking note:', err);
      }
    }

    return data;
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured yet');
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error signing out:', error);
  };

  // Send Password Reset Email
  const resetPassword = async (email) => {
    if (!supabase) throw new Error('Supabase is not configured yet');
    const redirectUrl = window.location.origin;
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw error;
    return data;
  };

  // Update New Password
  const updatePassword = async (newPassword) => {
    if (!supabase) throw new Error('Supabase is not configured yet');
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    setIsRecoveryMode(false);
    return data;
  };

  const value = {
    user,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isRecoveryMode,
    setIsRecoveryMode,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
