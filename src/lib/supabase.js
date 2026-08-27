import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rfecpnaxoaetnjslccsb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_8czreiNf0AnYqbH6oyLn6A_BVYlo5cX';

// In production (e.g. Vercel), route through same-origin `/api/supabase` reverse proxy
// This allows users in regions where `*.supabase.co` is ISP-blocked to sign in freely without VPN
const isBrowser = typeof window !== 'undefined';
const effectiveUrl = (isBrowser && !window.location.hostname.includes('localhost') && window.location.origin.startsWith('http'))
  ? `${window.location.origin}/api/supabase`
  : rawUrl;

// Check if Supabase credentials are configured
export const isSupabaseConfigured = Boolean(
  rawUrl && 
  supabaseAnonKey && 
  rawUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'
);

// Create Supabase client
export const supabase = isSupabaseConfigured
  ? createClient(effectiveUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
