import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

const ADMIN_EMAILS = ['khantkyawlinn.kkl@gmail.com'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup' | 'forgot' | 'newpassword'
  
  // Account Settings Modal State
  const [isAccountSettingsOpen, setIsAccountSettingsOpen] = useState(false);
  const [accountSettingsTab, setAccountSettingsTab] = useState('profile'); // 'profile' | 'security' | 'history'

  // Fetch / Refresh Pending Count for Admin
  const refreshPendingCount = useCallback(async () => {
    if (!supabase) return;
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (!error && count !== null) {
        setPendingCount(count);
      }
    } catch (e) {
      console.warn('Pending count fetch error:', e);
    }
  }, []);

  // Fetch Profile & Verify Status
  const fetchProfile = useCallback(async (currentUser) => {
    if (!supabase || !currentUser) {
      setUserProfile(null);
      setIsAdmin(false);
      return null;
    }

    const isSystemAdmin = ADMIN_EMAILS.includes(currentUser.email?.toLowerCase());

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching profile:', error);
      }

      const profile = data || {
        id: currentUser.id,
        full_name: currentUser.user_metadata?.full_name || 'Student',
        email: currentUser.email,
        status: isSystemAdmin ? 'approved' : (currentUser.user_metadata?.status || 'pending'),
        role: isSystemAdmin ? 'admin' : 'student',
      };

      // Auto-ensure admin profile is marked approved & role=admin
      if (isSystemAdmin && (profile.status !== 'approved' || profile.role !== 'admin')) {
        await supabase.from('profiles').upsert({
          id: currentUser.id,
          full_name: profile.full_name || 'Khant Kyaw Lin',
          email: currentUser.email,
          status: 'approved',
          role: 'admin',
          updated_at: new Date().toISOString(),
        });
        profile.status = 'approved';
        profile.role = 'admin';
      }

      setUserProfile(profile);
      setIsAdmin(isSystemAdmin || profile.role === 'admin');

      if (isSystemAdmin || profile.role === 'admin') {
        refreshPendingCount();
      }

      return profile;
    } catch (err) {
      console.error('fetchProfile error:', err);
      return null;
    }
  }, [refreshPendingCount]);

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
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser);
      }
      setLoading(false);
    });

    // Listen to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        await fetchProfile(currentUser);
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }

      if (event === 'PASSWORD_RECOVERY') {
        setAuthModalMode('newpassword');
        setIsAuthModalOpen(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

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
    
    const isSystemAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    const initialStatus = isSystemAdmin ? 'approved' : 'pending';
    const initialRole = isSystemAdmin ? 'admin' : 'student';

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: 'student_freshman',
          avatar_frame: 'frame_bronze',
          status: initialStatus,
          role: initialRole,
        },
      },
    });

    if (error) throw error;

    // Create profile entry with pending status
    if (data?.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          avatar_url: 'student_freshman',
          avatar_frame: 'frame_bronze',
          status: initialStatus,
          role: initialRole,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Profile creation note:', err);
      }

      // If registered as regular student, sign out so they cannot enter until admin approves
      if (!isSystemAdmin) {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
      }
    }

    return { ...data, isPending: !isSystemAdmin };
  };

  // Sign in with email and password + Admin Approval Verification Gate
  const signIn = async (email, password) => {
    if (!supabase) throw new Error('Supabase is not configured yet');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    if (data?.user) {
      const isSystemAdmin = ADMIN_EMAILS.includes(data.user.email?.toLowerCase());

      // If not system admin, check approval status from database
      if (!isSystemAdmin) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('status, role')
          .eq('id', data.user.id)
          .single();

        const status = profile?.status || data.user.user_metadata?.status || 'pending';

        if (status === 'pending') {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          throw new Error('⏳ Your account registration is pending review by the administrator (Khant Kyaw Lin). You will receive an email once approved.');
        }

        if (status === 'rejected') {
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
          throw new Error('❌ Your account registration was not approved. Please contact the administrator at khantkyawlinn.kkl@gmail.com.');
        }
      }

      await fetchProfile(data.user);
    }

    return data;
  };

  // Sign out
  const signOut = async () => {
    try {
      localStorage.removeItem('synapse_flashcard_status');
      localStorage.removeItem('synapse_quiz_history');
    } catch (e) {
      console.warn('Storage cleanup error:', e);
    }
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('Error signing out:', error);
    }
    setUser(null);
    setSession(null);
    setUserProfile(null);
    setIsAdmin(false);
    setIsAccountSettingsOpen(false);
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

  // Update Profile Details
  const updateProfile = async ({ fullName, avatarUrl, avatarFrame }) => {
    if (!supabase) throw new Error('Supabase is not configured yet');
    const updateData = {};
    if (fullName !== undefined) updateData.full_name = fullName;
    if (avatarUrl !== undefined) updateData.avatar_url = avatarUrl;
    if (avatarFrame !== undefined) updateData.avatar_frame = avatarFrame;

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
          avatar_url: avatarUrl || data.user.user_metadata?.avatar_url || 'student_freshman',
          avatar_frame: avatarFrame || data.user.user_metadata?.avatar_frame || 'frame_bronze',
          email: data.user.email,
          updated_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Profile table sync note:', err);
      }
      await fetchProfile(data.user);
    }
    return data;
  };

  const value = {
    user,
    session,
    userProfile,
    isAdmin,
    pendingCount,
    refreshPendingCount,
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
