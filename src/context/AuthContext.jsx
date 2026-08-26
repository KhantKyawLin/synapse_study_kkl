import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup' | 'forgot' | 'newpassword'
  
  // Account Settings Modal State
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [accountSettingsTab, setAccountSettingsTab] = useState('profile'); // 'profile' | 'security' | 'history'

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Check if URL contains type=recovery
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setAuthModalMode('newpassword');
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
        setAuthModalMode('newpassword');
        setIsAuthModalOpen(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const openAccountSettings = (tab = 'profile') => {
    setAccountSettingsTab(tab);
    setIsAccountSettingsOpen(true);
  };

  // Sign up with email, password, and full name
  const signUp = async (email, password, fullName) => {
    if (!supabase) throw new Error('Supabase is not configured yet');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: 'avatar_doctor_1',
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
          avatar_url: 'avatar_doctor_1',
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
    return data;
  };

  // Update Profile Details (Full Name and Avatar)
  const updateProfile = async ({ fullName, avatarUrl }) => {
    if (!supabase) throw new Error('Supabase is not configured yet');
    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;

    const { data, error } = await supabase.auth.updateUser({
      data: updateData,
    });
    if (error) throw error;

    if (data?.user) {
      setUser(data.user);
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName || data.user.user_metadata?.full_name || '',
          avatar_url: avatarUrl || data.user.user_metadata?.avatar_url || 'avatar_doctor_1',
          email: data.user.email,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Profile table sync note:', err);
      }
    }
    return data;
  };

  const value = {
    user,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    openAuthModal,
    isAccountSettingsOpen,
    setIsAccountSettingsOpen,
    accountSettingsTab,
    setAccountSettingsTab,
    openAccountSettings,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
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
